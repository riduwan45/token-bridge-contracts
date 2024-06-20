import {
  L1Network,
  L1ToL2MessageGasEstimator,
  L1ToL2MessageStatus,
  L1TransactionReceipt,
  L2Network,
  L2TransactionReceipt,
} from '@arbitrum/sdk'
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib'
import { JsonRpcProvider } from '@ethersproject/providers'
import { expect } from 'chai'
import { setupTokenBridgeInLocalEnv } from '../scripts/local-deployment/localDeploymentLib'
import {
  ERC20,
  ERC20__factory,
  IERC20Bridge__factory,
  IERC20__factory,
  IInbox__factory,
  IOwnable__factory,
  L1OrbitUSDCGateway__factory,
  L1GatewayRouter__factory,
  L1OrbitCustomGateway__factory,
  L1OrbitERC20Gateway__factory,
  L1OrbitGatewayRouter__factory,
  L1USDCGateway__factory,
  L2CustomGateway__factory,
  L2GatewayRouter__factory,
  L2USDCGateway__factory,
  ProxyAdmin__factory,
  TestArbCustomToken__factory,
  TestCustomTokenL1__factory,
  TestERC20,
  TestERC20__factory,
  TestOrbitCustomTokenL1__factory,
  TransparentUpgradeableProxy__factory,
  UpgradeExecutor__factory,
  IFiatToken__factory,
} from '../build/types'
import { defaultAbiCoder } from 'ethers/lib/utils'
import { BigNumber, Wallet, ethers } from 'ethers'
import { exit } from 'process'
import { getNetwork } from '@arbitrum/sdk/dist/lib/dataEntities/networks'

const config = {
  parentUrl: 'http://localhost:8547',
  childUrl: 'http://localhost:3347',
}

const LOCALHOST_L3_OWNER_KEY =
  '0xecdf21cb41c65afb51f91df408b7656e2c8739a5877f2814add0afd780cc210e'

let parentProvider: JsonRpcProvider
let childProvider: JsonRpcProvider

let deployerL1Wallet: Wallet
let deployerL2Wallet: Wallet

let userL1Wallet: Wallet
let userL2Wallet: Wallet

let _l1Network: L1Network
let _l2Network: L2Network

let token: TestERC20
let l2Token: ERC20
let nativeToken: ERC20 | undefined

describe('orbitTokenBridge', () => {
  // configure orbit token bridge
  before(async function () {
    parentProvider = new ethers.providers.JsonRpcProvider(config.parentUrl)
    childProvider = new ethers.providers.JsonRpcProvider(config.childUrl)

    const testDevKey =
      '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659'
    const testDevL1Wallet = new ethers.Wallet(testDevKey, parentProvider)
    const testDevL2Wallet = new ethers.Wallet(testDevKey, childProvider)

    const deployerKey = ethers.utils.sha256(
      ethers.utils.toUtf8Bytes('user_token_bridge_deployer')
    )
    deployerL1Wallet = new ethers.Wallet(deployerKey, parentProvider)
    deployerL2Wallet = new ethers.Wallet(deployerKey, childProvider)
    await (
      await testDevL1Wallet.sendTransaction({
        to: deployerL1Wallet.address,
        value: ethers.utils.parseEther('20.0'),
      })
    ).wait()
    await (
      await testDevL2Wallet.sendTransaction({
        to: deployerL2Wallet.address,
        value: ethers.utils.parseEther('20.0'),
      })
    ).wait()

    const { l1Network, l2Network } = await setupTokenBridgeInLocalEnv()

    _l1Network = l1Network
    _l2Network = l2Network

    // create user wallets and fund it
    const userKey = ethers.utils.sha256(ethers.utils.toUtf8Bytes('user_wallet'))
    userL1Wallet = new ethers.Wallet(userKey, parentProvider)
    userL2Wallet = new ethers.Wallet(userKey, childProvider)
    await (
      await deployerL1Wallet.sendTransaction({
        to: userL1Wallet.address,
        value: ethers.utils.parseEther('10.0'),
      })
    ).wait()
    await (
      await deployerL2Wallet.sendTransaction({
        to: userL2Wallet.address,
        value: ethers.utils.parseEther('10.0'),
      })
    ).wait()

    const nativeTokenAddress = await getFeeToken(
      l2Network.ethBridge.inbox,
      parentProvider
    )
    nativeToken =
      nativeTokenAddress === ethers.constants.AddressZero
        ? undefined
        : ERC20__factory.connect(nativeTokenAddress, userL1Wallet)

    if (nativeToken) {
      const supply = await nativeToken.balanceOf(deployerL1Wallet.address)
      await (
        await nativeToken
          .connect(deployerL1Wallet)
          .transfer(userL1Wallet.address, supply.div(10))
      ).wait()
    }
  })

  it('should have deployed token bridge contracts', async function () {
    // get router as entry point
    const l1Router = L1OrbitGatewayRouter__factory.connect(
      _l2Network.tokenBridge.l1GatewayRouter,
      parentProvider
    )

    expect((await l1Router.defaultGateway()).toLowerCase()).to.be.eq(
      _l2Network.tokenBridge.l1ERC20Gateway.toLowerCase()
    )
  })

  it('can deposit token via default gateway', async function () {
    // fund user to be able to pay retryable fees
    if (nativeToken) {
      await (
        await nativeToken
          .connect(deployerL1Wallet)
          .transfer(userL1Wallet.address, ethers.utils.parseEther('1000'))
      ).wait()
      nativeToken.connect(userL1Wallet)
    }

    // create token to be bridged
    const tokenFactory = await new TestERC20__factory(userL1Wallet).deploy()
    token = await tokenFactory.deployed()
    await (await token.mint()).wait()

    // snapshot state before
    const userTokenBalanceBefore = await token.balanceOf(userL1Wallet.address)

    const gatewayTokenBalanceBefore = await token.balanceOf(
      _l2Network.tokenBridge.l1ERC20Gateway
    )
    const userNativeTokenBalanceBefore = nativeToken
      ? await nativeToken.balanceOf(userL1Wallet.address)
      : await parentProvider.getBalance(userL1Wallet.address)
    const bridgeNativeTokenBalanceBefore = nativeToken
      ? await nativeToken.balanceOf(_l2Network.ethBridge.bridge)
      : await parentProvider.getBalance(_l2Network.ethBridge.bridge)

    // approve token
    const depositAmount = 350
    await (
      await token.approve(_l2Network.tokenBridge.l1ERC20Gateway, depositAmount)
    ).wait()

    // calculate retryable params
    const maxSubmissionCost = nativeToken
      ? BigNumber.from(0)
      : BigNumber.from(584000000000)
    const callhook = '0x'

    const gateway = L1OrbitERC20Gateway__factory.connect(
      _l2Network.tokenBridge.l1ERC20Gateway,
      userL1Wallet
    )
    const outboundCalldata = await gateway.getOutboundCalldata(
      token.address,
      userL1Wallet.address,
      userL2Wallet.address,
      depositAmount,
      callhook
    )

    const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(
      childProvider
    )
    const retryableParams = await l1ToL2MessageGasEstimate.estimateAll(
      {
        from: userL1Wallet.address,
        to: userL2Wallet.address,
        l2CallValue: BigNumber.from(0),
        excessFeeRefundAddress: userL1Wallet.address,
        callValueRefundAddress: userL1Wallet.address,
        data: outboundCalldata,
      },
      await getBaseFee(parentProvider),
      parentProvider
    )

    const gasLimit = retryableParams.gasLimit.mul(60)
    const maxFeePerGas = retryableParams.maxFeePerGas
    const tokenTotalFeeAmount = gasLimit.mul(maxFeePerGas).mul(2)

    // approve fee amount
    if (nativeToken) {
      await (
        await nativeToken.approve(
          _l2Network.tokenBridge.l1ERC20Gateway,
          tokenTotalFeeAmount
        )
      ).wait()
    }

    // bridge it
    const userEncodedData = nativeToken
      ? defaultAbiCoder.encode(
          ['uint256', 'bytes', 'uint256'],
          [maxSubmissionCost, callhook, tokenTotalFeeAmount]
        )
      : defaultAbiCoder.encode(
          ['uint256', 'bytes'],
          [maxSubmissionCost, callhook]
        )

    const router = nativeToken
      ? L1OrbitGatewayRouter__factory.connect(
          _l2Network.tokenBridge.l1GatewayRouter,
          userL1Wallet
        )
      : L1GatewayRouter__factory.connect(
          _l2Network.tokenBridge.l1GatewayRouter,
          userL1Wallet
        )

    const depositTx = await router.outboundTransferCustomRefund(
      token.address,
      userL1Wallet.address,
      userL2Wallet.address,
      depositAmount,
      gasLimit,
      maxFeePerGas,
      userEncodedData,
      { value: nativeToken ? BigNumber.from(0) : tokenTotalFeeAmount }
    )

    // wait for L2 msg to be executed
    await waitOnL2Msg(depositTx)

    ///// checks

    const l2TokenAddress = await router.calculateL2TokenAddress(token.address)
    l2Token = ERC20__factory.connect(l2TokenAddress, childProvider)
    expect(await l2Token.balanceOf(userL2Wallet.address)).to.be.eq(
      depositAmount
    )

    const userTokenBalanceAfter = await token.balanceOf(userL1Wallet.address)
    expect(userTokenBalanceBefore.sub(userTokenBalanceAfter)).to.be.eq(
      depositAmount
    )

    const gatewayTokenBalanceAfter = await token.balanceOf(
      _l2Network.tokenBridge.l1ERC20Gateway
    )
    expect(gatewayTokenBalanceAfter.sub(gatewayTokenBalanceBefore)).to.be.eq(
      depositAmount
    )

    const userNativeTokenBalanceAfter = nativeToken
      ? await nativeToken.balanceOf(userL1Wallet.address)
      : await parentProvider.getBalance(userL1Wallet.address)
    if (nativeToken) {
      expect(
        userNativeTokenBalanceBefore.sub(userNativeTokenBalanceAfter)
      ).to.be.eq(tokenTotalFeeAmount)
    } else {
      expect(
        userNativeTokenBalanceBefore.sub(userNativeTokenBalanceAfter)
      ).to.be.gte(tokenTotalFeeAmount.toNumber())
    }

    const bridgeNativeTokenBalanceAfter = nativeToken
      ? await nativeToken.balanceOf(_l2Network.ethBridge.bridge)
      : await parentProvider.getBalance(_l2Network.ethBridge.bridge)
    expect(
      bridgeNativeTokenBalanceAfter.sub(bridgeNativeTokenBalanceBefore)
    ).to.be.eq(tokenTotalFeeAmount)
  })

  xit('can withdraw token via default gateway', async function () {
    // fund userL2Wallet so it can pay for L2 withdraw TX
    await depositNativeToL2()

    // snapshot state before
    const userL1TokenBalanceBefore = await token.balanceOf(userL1Wallet.address)
    const userL2TokenBalanceBefore = await l2Token.balanceOf(
      userL2Wallet.address
    )
    const l1GatewayTokenBalanceBefore = await token.balanceOf(
      _l2Network.tokenBridge.l1ERC20Gateway
    )
    const l2TokenSupplyBefore = await l2Token.totalSupply()

    // start withdrawal
    const withdrawalAmount = 250
    const l2Router = L2GatewayRouter__factory.connect(
      _l2Network.tokenBridge.l2GatewayRouter,
      userL2Wallet
    )
    const withdrawTx = await l2Router[
      'outboundTransfer(address,address,uint256,bytes)'
    ](token.address, userL1Wallet.address, withdrawalAmount, '0x')
    const withdrawReceipt = await withdrawTx.wait()
    const l2Receipt = new L2TransactionReceipt(withdrawReceipt)

    // wait until dispute period passes and withdrawal is ready for execution
    await sleep(5 * 1000)

    const messages = await l2Receipt.getL2ToL1Messages(userL1Wallet)
    const l2ToL1Msg = messages[0]
    const timeToWaitMs = 1000
    await l2ToL1Msg.waitUntilReadyToExecute(childProvider, timeToWaitMs)

    // execute on L1
    await (await l2ToL1Msg.execute(childProvider)).wait()

    //// checks
    const userL1TokenBalanceAfter = await token.balanceOf(userL1Wallet.address)
    expect(userL1TokenBalanceAfter.sub(userL1TokenBalanceBefore)).to.be.eq(
      withdrawalAmount
    )

    const userL2TokenBalanceAfter = await l2Token.balanceOf(
      userL2Wallet.address
    )
    expect(userL2TokenBalanceBefore.sub(userL2TokenBalanceAfter)).to.be.eq(
      withdrawalAmount
    )

    const l1GatewayTokenBalanceAfter = await token.balanceOf(
      _l2Network.tokenBridge.l1ERC20Gateway
    )
    expect(
      l1GatewayTokenBalanceBefore.sub(l1GatewayTokenBalanceAfter)
    ).to.be.eq(withdrawalAmount)

    const l2TokenSupplyAfter = await l2Token.totalSupply()
    expect(l2TokenSupplyBefore.sub(l2TokenSupplyAfter)).to.be.eq(
      withdrawalAmount
    )
  })

  it('can deposit token via custom gateway', async function () {
    // fund user to be able to pay retryable fees
    if (nativeToken) {
      await (
        await nativeToken
          .connect(deployerL1Wallet)
          .transfer(userL1Wallet.address, ethers.utils.parseEther('1000'))
      ).wait()
    }

    // create L1 custom token
    const customL1TokenFactory = nativeToken
      ? await new TestOrbitCustomTokenL1__factory(deployerL1Wallet).deploy(
          _l2Network.tokenBridge.l1CustomGateway,
          _l2Network.tokenBridge.l1GatewayRouter
        )
      : await new TestCustomTokenL1__factory(deployerL1Wallet).deploy(
          _l2Network.tokenBridge.l1CustomGateway,
          _l2Network.tokenBridge.l1GatewayRouter
        )
    const customL1Token = await customL1TokenFactory.deployed()
    await (await customL1Token.connect(userL1Wallet).mint()).wait()

    // create L2 custom token
    if (nativeToken) {
      await depositNativeToL2()
    }
    const customL2TokenFactory = await new TestArbCustomToken__factory(
      deployerL2Wallet
    ).deploy(_l2Network.tokenBridge.l2CustomGateway, customL1Token.address)
    const customL2Token = await customL2TokenFactory.deployed()

    // prepare custom gateway registration params
    const router = nativeToken
      ? L1OrbitGatewayRouter__factory.connect(
          _l2Network.tokenBridge.l1GatewayRouter,
          userL1Wallet
        )
      : L1GatewayRouter__factory.connect(
          _l2Network.tokenBridge.l1GatewayRouter,
          userL1Wallet
        )
    const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(
      childProvider
    )

    const routerData =
      L2GatewayRouter__factory.createInterface().encodeFunctionData(
        'setGateway',
        [[customL1Token.address], [_l2Network.tokenBridge.l2CustomGateway]]
      )
    const routerRetryableParams = await l1ToL2MessageGasEstimate.estimateAll(
      {
        from: _l2Network.tokenBridge.l1GatewayRouter,
        to: _l2Network.tokenBridge.l2GatewayRouter,
        l2CallValue: BigNumber.from(0),
        excessFeeRefundAddress: userL1Wallet.address,
        callValueRefundAddress: userL1Wallet.address,
        data: routerData,
      },
      await getBaseFee(parentProvider),
      parentProvider
    )

    const gatewayData =
      L2CustomGateway__factory.createInterface().encodeFunctionData(
        'registerTokenFromL1',
        [[customL1Token.address], [customL2Token.address]]
      )
    const gwRetryableParams = await l1ToL2MessageGasEstimate.estimateAll(
      {
        from: _l2Network.tokenBridge.l1CustomGateway,
        to: _l2Network.tokenBridge.l2CustomGateway,
        l2CallValue: BigNumber.from(0),
        excessFeeRefundAddress: userL1Wallet.address,
        callValueRefundAddress: userL1Wallet.address,
        data: gatewayData,
      },
      await getBaseFee(parentProvider),
      parentProvider
    )

    // approve fee amount
    const valueForGateway = gwRetryableParams.deposit.mul(BigNumber.from(2))
    const valueForRouter = routerRetryableParams.deposit.mul(BigNumber.from(2))
    if (nativeToken) {
      await (
        await nativeToken.approve(
          customL1Token.address,
          valueForGateway.add(valueForRouter)
        )
      ).wait()
    }

    // do the custom gateway registration
    const receipt = await (
      await customL1Token
        .connect(userL1Wallet)
        .registerTokenOnL2(
          customL2Token.address,
          gwRetryableParams.maxSubmissionCost,
          routerRetryableParams.maxSubmissionCost,
          gwRetryableParams.gasLimit.mul(2),
          routerRetryableParams.gasLimit.mul(2),
          BigNumber.from(100000000),
          valueForGateway,
          valueForRouter,
          userL1Wallet.address,
          {
            value: nativeToken
              ? BigNumber.from(0)
              : valueForGateway.add(valueForRouter),
          }
        )
    ).wait()

    /// wait for execution of both tickets
    const l1TxReceipt = new L1TransactionReceipt(receipt)
    const messages = await l1TxReceipt.getL1ToL2Messages(childProvider)
    const messageResults = await Promise.all(
      messages.map(message => message.waitForStatus())
    )
    if (
      messageResults[0].status !== L1ToL2MessageStatus.REDEEMED ||
      messageResults[1].status !== L1ToL2MessageStatus.REDEEMED
    ) {
      console.log(
        `Retryable ticket (ID ${messages[0].retryableCreationId}) status: ${
          L1ToL2MessageStatus[messageResults[0].status]
        }`
      )
      console.log(
        `Retryable ticket (ID ${messages[1].retryableCreationId}) status: ${
          L1ToL2MessageStatus[messageResults[1].status]
        }`
      )
      exit()
    }

    // snapshot state before
    const userTokenBalanceBefore = await customL1Token.balanceOf(
      userL1Wallet.address
    )
    const gatewayTokenBalanceBefore = await customL1Token.balanceOf(
      _l2Network.tokenBridge.l1CustomGateway
    )
    const userNativeTokenBalanceBefore = nativeToken
      ? await nativeToken.balanceOf(userL1Wallet.address)
      : await parentProvider.getBalance(userL1Wallet.address)
    const bridgeNativeTokenBalanceBefore = nativeToken
      ? await nativeToken.balanceOf(_l2Network.ethBridge.bridge)
      : await parentProvider.getBalance(_l2Network.ethBridge.bridge)

    // approve token
    const depositAmount = 110
    await (
      await customL1Token
        .connect(userL1Wallet)
        .approve(_l2Network.tokenBridge.l1CustomGateway, depositAmount)
    ).wait()

    // calculate retryable params
    const maxSubmissionCost = 0
    const callhook = '0x'

    const gateway = L1OrbitCustomGateway__factory.connect(
      _l2Network.tokenBridge.l1CustomGateway,
      userL1Wallet
    )
    const outboundCalldata = await gateway.getOutboundCalldata(
      customL1Token.address,
      userL1Wallet.address,
      userL2Wallet.address,
      depositAmount,
      callhook
    )

    const retryableParams = await l1ToL2MessageGasEstimate.estimateAll(
      {
        from: userL1Wallet.address,
        to: userL2Wallet.address,
        l2CallValue: BigNumber.from(0),
        excessFeeRefundAddress: userL1Wallet.address,
        callValueRefundAddress: userL1Wallet.address,
        data: outboundCalldata,
      },
      await getBaseFee(parentProvider),
      parentProvider
    )

    const gasLimit = retryableParams.gasLimit.mul(40)
    const maxFeePerGas = retryableParams.maxFeePerGas
    const tokenTotalFeeAmount = gasLimit.mul(maxFeePerGas).mul(2)

    // approve fee amount
    if (nativeToken) {
      await (
        await nativeToken.approve(
          _l2Network.tokenBridge.l1CustomGateway,
          tokenTotalFeeAmount
        )
      ).wait()
    }

    // bridge it
    const userEncodedData = nativeToken
      ? defaultAbiCoder.encode(
          ['uint256', 'bytes', 'uint256'],
          [maxSubmissionCost, callhook, tokenTotalFeeAmount]
        )
      : defaultAbiCoder.encode(
          ['uint256', 'bytes'],
          [BigNumber.from(334400000000), callhook]
        )

    const depositTx = await router.outboundTransferCustomRefund(
      customL1Token.address,
      userL1Wallet.address,
      userL2Wallet.address,
      depositAmount,
      gasLimit,
      maxFeePerGas,
      userEncodedData,
      { value: nativeToken ? BigNumber.from(0) : tokenTotalFeeAmount }
    )

    // wait for L2 msg to be executed
    await waitOnL2Msg(depositTx)

    ///// checks
    expect(await router.getGateway(customL1Token.address)).to.be.eq(
      _l2Network.tokenBridge.l1CustomGateway
    )

    const l2TokenAddress = await router.calculateL2TokenAddress(
      customL1Token.address
    )

    l2Token = ERC20__factory.connect(l2TokenAddress, childProvider)
    expect(await l2Token.balanceOf(userL2Wallet.address)).to.be.eq(
      depositAmount
    )

    const userTokenBalanceAfter = await customL1Token.balanceOf(
      userL1Wallet.address
    )
    expect(userTokenBalanceBefore.sub(userTokenBalanceAfter)).to.be.eq(
      depositAmount
    )

    const gatewayTokenBalanceAfter = await customL1Token.balanceOf(
      _l2Network.tokenBridge.l1CustomGateway
    )
    expect(gatewayTokenBalanceAfter.sub(gatewayTokenBalanceBefore)).to.be.eq(
      depositAmount
    )

    const userNativeTokenBalanceAfter = nativeToken
      ? await nativeToken.balanceOf(userL1Wallet.address)
      : await parentProvider.getBalance(userL1Wallet.address)
    if (nativeToken) {
      expect(
        userNativeTokenBalanceBefore.sub(userNativeTokenBalanceAfter)
      ).to.be.eq(tokenTotalFeeAmount)
    } else {
      expect(
        userNativeTokenBalanceBefore.sub(userNativeTokenBalanceAfter)
      ).to.be.gte(tokenTotalFeeAmount.toNumber())
    }
    const bridgeNativeTokenBalanceAfter = nativeToken
      ? await nativeToken.balanceOf(_l2Network.ethBridge.bridge)
      : await parentProvider.getBalance(_l2Network.ethBridge.bridge)
    expect(
      bridgeNativeTokenBalanceAfter.sub(bridgeNativeTokenBalanceBefore)
    ).to.be.eq(tokenTotalFeeAmount)
  })

  it('can upgrade from bridged USDC to native USDC when eth is native token', async function () {
    /// test applicable only for eth based chains
    if (nativeToken) {
      return
    }

    /// create new L1 usdc gateway behind proxy
    const proxyAdminFac = await new ProxyAdmin__factory(
      deployerL1Wallet
    ).deploy()
    const proxyAdmin = await proxyAdminFac.deployed()
    const l1USDCCustomGatewayFactory = await new L1USDCGateway__factory(
      deployerL1Wallet
    ).deploy()
    const l1USDCCustomGatewayLogic = await l1USDCCustomGatewayFactory.deployed()
    const tupFactory = await new TransparentUpgradeableProxy__factory(
      deployerL1Wallet
    ).deploy(l1USDCCustomGatewayLogic.address, proxyAdmin.address, '0x')
    const tup = await tupFactory.deployed()
    const l1USDCCustomGateway = L1USDCGateway__factory.connect(
      tup.address,
      deployerL1Wallet
    )
    console.log('L1USDCGateway address: ', l1USDCCustomGateway.address)

    /// create new L2 usdc gateway behind proxy
    const proxyAdminL2Fac = await new ProxyAdmin__factory(
      deployerL2Wallet
    ).deploy()
    const proxyAdminL2 = await proxyAdminL2Fac.deployed()
    const l2USDCCustomGatewayFactory = await new L2USDCGateway__factory(
      deployerL2Wallet
    ).deploy()
    const l2USDCCustomGatewayLogic = await l2USDCCustomGatewayFactory.deployed()
    const tupL2Factory = await new TransparentUpgradeableProxy__factory(
      deployerL2Wallet
    ).deploy(l2USDCCustomGatewayLogic.address, proxyAdminL2.address, '0x')
    const tupL2 = await tupL2Factory.deployed()
    const l2USDCCustomGateway = L2USDCGateway__factory.connect(
      tupL2.address,
      deployerL2Wallet
    )
    console.log('L2USDCGateway address: ', l2USDCCustomGateway.address)

    /// create l1 usdc behind proxy
    const l1UsdcLogic = await _deployBridgedUsdcToken(deployerL1Wallet)
    const tupL1UsdcFactory = await new TransparentUpgradeableProxy__factory(
      deployerL1Wallet
    ).deploy(l1UsdcLogic.address, proxyAdmin.address, '0x')
    const tupL1Usdc = await tupL1UsdcFactory.deployed()
    const l1UsdcInit = IFiatToken__factory.connect(
      tupL1Usdc.address,
      deployerL1Wallet
    )
    const masterMinterL1 = deployerL1Wallet
    await (
      await l1UsdcInit.initialize(
        'USDC token',
        'USDC.e',
        'USD',
        6,
        masterMinterL1.address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        deployerL2Wallet.address
      )
    ).wait()
    await (await l1UsdcInit.initializeV2('USDC')).wait()
    await (
      await l1UsdcInit.initializeV2_1(ethers.Wallet.createRandom().address)
    ).wait()
    await (await l1UsdcInit.initializeV2_2([], 'USDC')).wait()
    const l1Usdc = IERC20__factory.connect(l1UsdcInit.address, deployerL1Wallet)
    console.log('L1 USDC address: ', l1Usdc.address)

    /// create l2 usdc behind proxy
    const l2UsdcLogic = await _deployBridgedUsdcToken(deployerL2Wallet)
    const tupL2UsdcFactory = await new TransparentUpgradeableProxy__factory(
      deployerL2Wallet
    ).deploy(l2UsdcLogic.address, proxyAdminL2.address, '0x')
    const tupL2Usdc = await tupL2UsdcFactory.deployed()
    const l2UsdcInit = IFiatToken__factory.connect(
      tupL2Usdc.address,
      deployerL2Wallet
    )
    const masterMinterL2 = deployerL2Wallet
    await (
      await l2UsdcInit.initialize(
        'USDC token',
        'USDC.e',
        'USD',
        6,
        masterMinterL2.address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        deployerL2Wallet.address
      )
    ).wait()
    await (await l2UsdcInit.initializeV2('USDC')).wait()
    await (
      await l2UsdcInit.initializeV2_1(ethers.Wallet.createRandom().address)
    ).wait()
    await (await l2UsdcInit.initializeV2_2([], 'USDC.e')).wait()
    const l2Usdc = IERC20__factory.connect(l2UsdcInit.address, deployerL2Wallet)
    console.log('L2 USDC address: ', l2Usdc.address)

    /// initialize gateways
    await (
      await l1USDCCustomGateway.initialize(
        l2USDCCustomGateway.address,
        _l2Network.tokenBridge.l1GatewayRouter,
        _l2Network.ethBridge.inbox,
        l1Usdc.address,
        l2Usdc.address,
        deployerL1Wallet.address
      )
    ).wait()
    console.log('L1 USDC custom gateway initialized')

    await (
      await l2USDCCustomGateway.initialize(
        l1USDCCustomGateway.address,
        _l2Network.tokenBridge.l2GatewayRouter,
        l1Usdc.address,
        l2Usdc.address,
        deployerL2Wallet.address
      )
    ).wait()
    console.log('L2 USDC custom gateway initialized')

    /// register USDC custom gateway
    const router = L1GatewayRouter__factory.connect(
      _l2Network.tokenBridge.l1GatewayRouter,
      deployerL1Wallet
    )
    const l2Router = L2GatewayRouter__factory.connect(
      _l2Network.tokenBridge.l2GatewayRouter,
      deployerL2Wallet
    )
    const maxGas = BigNumber.from(500000)
    const gasPriceBid = BigNumber.from(200000000)
    let maxSubmissionCost = BigNumber.from(257600000000)
    const registrationCalldata = router.interface.encodeFunctionData(
      'setGateways',
      [
        [l1Usdc.address],
        [l1USDCCustomGateway.address],
        maxGas,
        gasPriceBid,
        maxSubmissionCost,
      ]
    )
    const rollupOwner = new Wallet(LOCALHOST_L3_OWNER_KEY, parentProvider)
    const upExec = UpgradeExecutor__factory.connect(
      await IOwnable__factory.connect(
        _l2Network.ethBridge.rollup,
        deployerL1Wallet
      ).owner(),
      rollupOwner
    )
    const gwRegistrationTx = await upExec.executeCall(
      router.address,
      registrationCalldata,
      {
        value: maxGas.mul(gasPriceBid).add(maxSubmissionCost),
      }
    )
    await waitOnL2Msg(gwRegistrationTx)
    console.log('USDC custom gateway registered')

    /// check gateway registration
    expect(await router.getGateway(l1Usdc.address)).to.be.eq(
      l1USDCCustomGateway.address
    )
    expect(await l1USDCCustomGateway.depositsPaused()).to.be.eq(false)
    expect(await l2Router.getGateway(l1Usdc.address)).to.be.eq(
      l2USDCCustomGateway.address
    )
    expect(await l2USDCCustomGateway.withdrawalsPaused()).to.be.eq(false)

    /// add minter role with max allowance to L2 gateway
    await (
      await l2UsdcInit
        .connect(masterMinterL2)
        .configureMinter(
          l2USDCCustomGateway.address,
          ethers.constants.MaxUint256
        )
    ).wait()
    expect(await l2UsdcInit.isMinter(l2USDCCustomGateway.address)).to.be.eq(
      true
    )
    console.log('Minter role with max allowance granted to L2 USDC gateway')

    /// mint some USDC to user
    await (
      await l1UsdcInit
        .connect(masterMinterL1)
        .configureMinter(
          masterMinterL1.address,
          ethers.utils.parseEther('1000')
        )
    ).wait()
    await (
      await l1UsdcInit
        .connect(masterMinterL1)
        .mint(userL1Wallet.address, ethers.utils.parseEther('10'))
    ).wait()
    console.log('Minted USDC to user')

    /// do a deposit
    const depositAmount = ethers.utils.parseEther('2')
    await (
      await l1Usdc
        .connect(userL1Wallet)
        .approve(l1USDCCustomGateway.address, depositAmount)
    ).wait()
    maxSubmissionCost = BigNumber.from(334400000000)
    const depositTx = await router
      .connect(userL1Wallet)
      .outboundTransferCustomRefund(
        l1Usdc.address,
        userL2Wallet.address,
        userL2Wallet.address,
        depositAmount,
        maxGas,
        gasPriceBid,
        defaultAbiCoder.encode(['uint256', 'bytes'], [maxSubmissionCost, '0x']),
        { value: maxGas.mul(gasPriceBid).add(maxSubmissionCost) }
      )
    await waitOnL2Msg(depositTx)
    expect(await l2Usdc.balanceOf(userL2Wallet.address)).to.be.eq(depositAmount)
    expect(await l1Usdc.balanceOf(l1USDCCustomGateway.address)).to.be.eq(
      depositAmount
    )
    expect(await l2Usdc.totalSupply()).to.be.eq(depositAmount)
    console.log('Deposited USDC')

    /// pause deposits
    await (await l1USDCCustomGateway.pauseDeposits()).wait()
    expect(await l1USDCCustomGateway.depositsPaused()).to.be.eq(true)
    console.log('Deposits paused')

    /// chain owner/circle checks that all pending deposits (all retryables depositing usdc) are executed

    /// pause withdrawals and send L2 supply to L1
    const pauseReceipt = await (
      await l2USDCCustomGateway.pauseWithdrawals()
    ).wait()
    const l2PauseReceipt = new L2TransactionReceipt(pauseReceipt)
    const messages = await l2PauseReceipt.getL2ToL1Messages(userL1Wallet)
    const l2ToL1Msg = messages[0]
    const timeToWaitMs = 60 * 1000
    await l2ToL1Msg.waitUntilReadyToExecute(
      deployerL2Wallet.provider!,
      timeToWaitMs
    )
    // execute msg on L1
    await (await l2ToL1Msg.execute(deployerL2Wallet.provider!)).wait()

    // check withdrawals are paused and l2 supply is set in l1 gateway
    expect(await l2USDCCustomGateway.withdrawalsPaused()).to.be.eq(true)
    expect(await l1USDCCustomGateway.l2GatewaySupply()).to.be.gt(0)
    console.log('Withdrawals paused and L2 supply set in L1 gateway')

    /// make circle the burner
    const circleWallet = ethers.Wallet.createRandom().connect(parentProvider)
    await (
      await deployerL1Wallet.sendTransaction({
        to: circleWallet.address,
        value: ethers.utils.parseEther('1'),
      })
    ).wait()
    await (await l1USDCCustomGateway.setBurner(circleWallet.address)).wait()

    /// add minter rights to usdc gateway so it can burn USDC
    await (
      await l1UsdcInit.configureMinter(l1USDCCustomGateway.address, 0)
    ).wait()
    console.log('Minter role with 0 allowance added to L1 USDC gateway')

    /// remove minter role from the L2 gateway
    await (
      await l2UsdcInit
        .connect(masterMinterL2)
        .removeMinter(l2USDCCustomGateway.address)
    ).wait()
    expect(await l2UsdcInit.isMinter(l2USDCCustomGateway.address)).to.be.eq(
      false
    )
    console.log('Minter role removed from L2 USDC gateway')

    /// transfer child chain USDC ownership to circle
    await (await l2UsdcInit.transferOwnership(circleWallet.address)).wait()
    expect(await l2UsdcInit.owner()).to.be.eq(circleWallet.address)
    console.log('L2 USDC ownership transferred to circle')

    /// circle burns USDC on L1
    await (
      await l1USDCCustomGateway.connect(circleWallet).burnLockedUSDC()
    ).wait()
    expect(await l1Usdc.balanceOf(l1USDCCustomGateway.address)).to.be.eq(0)
    expect(await l2Usdc.balanceOf(userL2Wallet.address)).to.be.eq(depositAmount)
    console.log('USDC burned')
  })

  it('can upgrade from bridged USDC to native USDC when fee token is used', async function () {
    /// test applicable only for fee token based chains
    if (!nativeToken) {
      return
    }

    /// create new L1 usdc gateway behind proxy
    const proxyAdminFac = await new ProxyAdmin__factory(
      deployerL1Wallet
    ).deploy()
    const proxyAdmin = await proxyAdminFac.deployed()
    const l1USDCCustomGatewayFactory = await new L1OrbitUSDCGateway__factory(
      deployerL1Wallet
    ).deploy()
    const l1USDCCustomGatewayLogic = await l1USDCCustomGatewayFactory.deployed()
    const tupFactory = await new TransparentUpgradeableProxy__factory(
      deployerL1Wallet
    ).deploy(l1USDCCustomGatewayLogic.address, proxyAdmin.address, '0x')
    const tup = await tupFactory.deployed()
    const l1USDCCustomGateway = L1USDCGateway__factory.connect(
      tup.address,
      deployerL1Wallet
    )
    console.log('L1USDCGateway address: ', l1USDCCustomGateway.address)

    /// create new L2 usdc gateway behind proxy
    const proxyAdminL2Fac = await new ProxyAdmin__factory(
      deployerL2Wallet
    ).deploy()
    const proxyAdminL2 = await proxyAdminL2Fac.deployed()
    const l2USDCCustomGatewayFactory = await new L2USDCGateway__factory(
      deployerL2Wallet
    ).deploy()
    const l2USDCCustomGatewayLogic = await l2USDCCustomGatewayFactory.deployed()
    const tupL2Factory = await new TransparentUpgradeableProxy__factory(
      deployerL2Wallet
    ).deploy(l2USDCCustomGatewayLogic.address, proxyAdminL2.address, '0x')
    const tupL2 = await tupL2Factory.deployed()
    const l2USDCCustomGateway = L2USDCGateway__factory.connect(
      tupL2.address,
      deployerL2Wallet
    )
    console.log('L2USDCGateway address: ', l2USDCCustomGateway.address)

    /// create l1 usdc behind proxy
    const l1UsdcLogic = await _deployBridgedUsdcToken(deployerL1Wallet)
    const tupL1UsdcFactory = await new TransparentUpgradeableProxy__factory(
      deployerL1Wallet
    ).deploy(l1UsdcLogic.address, proxyAdmin.address, '0x')
    const tupL1Usdc = await tupL1UsdcFactory.deployed()
    const l1UsdcInit = IFiatToken__factory.connect(
      tupL1Usdc.address,
      deployerL1Wallet
    )
    const masterMinterL1 = deployerL1Wallet
    await (
      await l1UsdcInit.initialize(
        'USDC token',
        'USDC.e',
        'USD',
        6,
        masterMinterL1.address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        deployerL2Wallet.address
      )
    ).wait()
    await (await l1UsdcInit.initializeV2('USDC')).wait()
    await (
      await l1UsdcInit.initializeV2_1(ethers.Wallet.createRandom().address)
    ).wait()
    await (await l1UsdcInit.initializeV2_2([], 'USDC')).wait()
    const l1Usdc = IERC20__factory.connect(l1UsdcInit.address, deployerL1Wallet)
    console.log('L1 USDC address: ', l1Usdc.address)

    /// create l2 usdc behind proxy
    const l2UsdcLogic = await _deployBridgedUsdcToken(deployerL2Wallet)
    const tupL2UsdcFactory = await new TransparentUpgradeableProxy__factory(
      deployerL2Wallet
    ).deploy(l2UsdcLogic.address, proxyAdminL2.address, '0x')
    const tupL2Usdc = await tupL2UsdcFactory.deployed()
    const l2UsdcInit = IFiatToken__factory.connect(
      tupL2Usdc.address,
      deployerL2Wallet
    )
    const masterMinterL2 = deployerL2Wallet
    await (
      await l2UsdcInit.initialize(
        'USDC token',
        'USDC.e',
        'USD',
        6,
        masterMinterL2.address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        deployerL2Wallet.address
      )
    ).wait()
    await (await l2UsdcInit.initializeV2('USDC')).wait()
    await (
      await l2UsdcInit.initializeV2_1(ethers.Wallet.createRandom().address)
    ).wait()
    await (await l2UsdcInit.initializeV2_2([], 'USDC.e')).wait()
    const l2Usdc = IERC20__factory.connect(l2UsdcInit.address, deployerL2Wallet)
    console.log('L2 USDC address: ', l2Usdc.address)

    /// initialize gateways
    await (
      await l1USDCCustomGateway.initialize(
        l2USDCCustomGateway.address,
        _l2Network.tokenBridge.l1GatewayRouter,
        _l2Network.ethBridge.inbox,
        l1Usdc.address,
        l2Usdc.address,
        deployerL1Wallet.address
      )
    ).wait()
    console.log('L1 USDC custom gateway initialized')

    await (
      await l2USDCCustomGateway.initialize(
        l1USDCCustomGateway.address,
        _l2Network.tokenBridge.l2GatewayRouter,
        l1Usdc.address,
        l2Usdc.address,
        deployerL2Wallet.address
      )
    ).wait()
    console.log('L2 USDC custom gateway initialized')

    /// register USDC custom gateway
    const router = L1OrbitGatewayRouter__factory.connect(
      _l2Network.tokenBridge.l1GatewayRouter,
      deployerL1Wallet
    )
    const l2Router = L2GatewayRouter__factory.connect(
      _l2Network.tokenBridge.l2GatewayRouter,
      deployerL2Wallet
    )
    const maxGas = BigNumber.from(500000)
    const gasPriceBid = BigNumber.from(200000000)
    const totalFeeTokenAmount = maxGas.mul(gasPriceBid)
    const maxSubmissionCost = BigNumber.from(0)

    // prefund inbox to pay for registration
    await (
      await nativeToken
        .connect(deployerL1Wallet)
        .transfer(_l2Network.ethBridge.inbox, totalFeeTokenAmount)
    ).wait()

    const registrationCalldata = (router.interface as any).encodeFunctionData(
      'setGateways(address[],address[],uint256,uint256,uint256,uint256)',
      [
        [l1Usdc.address],
        [l1USDCCustomGateway.address],
        maxGas,
        gasPriceBid,
        maxSubmissionCost,
        totalFeeTokenAmount,
      ]
    )
    const rollupOwner = new Wallet(LOCALHOST_L3_OWNER_KEY, parentProvider)
    // approve fee amount
    console.log('Approving fee amount')
    await (
      await nativeToken
        .connect(rollupOwner)
        .approve(l1USDCCustomGateway.address, totalFeeTokenAmount)
    ).wait()

    const upExec = UpgradeExecutor__factory.connect(
      await IOwnable__factory.connect(
        _l2Network.ethBridge.rollup,
        deployerL1Wallet
      ).owner(),
      rollupOwner
    )
    const gwRegistrationTx = await upExec.executeCall(
      router.address,
      registrationCalldata
    )
    await waitOnL2Msg(gwRegistrationTx)
    console.log('USDC custom gateway registered')

    /// check gateway registration
    expect(await router.getGateway(l1Usdc.address)).to.be.eq(
      l1USDCCustomGateway.address
    )
    expect(await l1USDCCustomGateway.depositsPaused()).to.be.eq(false)
    expect(await l2Router.getGateway(l1Usdc.address)).to.be.eq(
      l2USDCCustomGateway.address
    )
    expect(await l2USDCCustomGateway.withdrawalsPaused()).to.be.eq(false)

    /// add minter role with max allowance to L2 gateway
    await (
      await l2UsdcInit
        .connect(masterMinterL2)
        .configureMinter(
          l2USDCCustomGateway.address,
          ethers.constants.MaxUint256
        )
    ).wait()
    expect(await l2UsdcInit.isMinter(l2USDCCustomGateway.address)).to.be.eq(
      true
    )
    console.log('Minter role with max allowance granted to L2 USDC gateway')

    /// mint some USDC to user
    await (
      await l1UsdcInit
        .connect(masterMinterL1)
        .configureMinter(
          masterMinterL1.address,
          ethers.utils.parseEther('1000')
        )
    ).wait()
    await (
      await l1UsdcInit
        .connect(masterMinterL1)
        .mint(userL1Wallet.address, ethers.utils.parseEther('10'))
    ).wait()
    console.log('Minted USDC to user')

    /// do a deposit
    const depositAmount = ethers.utils.parseEther('2')
    await (
      await l1Usdc
        .connect(userL1Wallet)
        .approve(l1USDCCustomGateway.address, depositAmount)
    ).wait()

    // approve fee amount
    await (
      await nativeToken
        .connect(userL1Wallet)
        .approve(l1USDCCustomGateway.address, totalFeeTokenAmount)
    ).wait()

    const depositTx = await router
      .connect(userL1Wallet)
      .outboundTransferCustomRefund(
        l1Usdc.address,
        userL2Wallet.address,
        userL2Wallet.address,
        depositAmount,
        maxGas,
        gasPriceBid,
        defaultAbiCoder.encode(
          ['uint256', 'bytes', 'uint256'],
          [maxSubmissionCost, '0x', totalFeeTokenAmount]
        )
      )
    await waitOnL2Msg(depositTx)
    expect(await l2Usdc.balanceOf(userL2Wallet.address)).to.be.eq(depositAmount)
    expect(await l1Usdc.balanceOf(l1USDCCustomGateway.address)).to.be.eq(
      depositAmount
    )
    expect(await l2Usdc.totalSupply()).to.be.eq(depositAmount)
    console.log('Deposited USDC')

    /// pause deposits
    await (await l1USDCCustomGateway.pauseDeposits()).wait()
    expect(await l1USDCCustomGateway.depositsPaused()).to.be.eq(true)
    console.log('Deposits paused')

    /// chain owner/circle checks that all pending deposits (all retryables depositing usdc) are executed

    /// pause withdrawals and send L2 supply to L1
    const pauseReceipt = await (
      await l2USDCCustomGateway.pauseWithdrawals()
    ).wait()
    const l2PauseReceipt = new L2TransactionReceipt(pauseReceipt)
    const messages = await l2PauseReceipt.getL2ToL1Messages(userL1Wallet)
    const l2ToL1Msg = messages[0]
    const timeToWaitMs = 60 * 1000
    await l2ToL1Msg.waitUntilReadyToExecute(
      deployerL2Wallet.provider!,
      timeToWaitMs
    )
    // execute msg on L1
    await (await l2ToL1Msg.execute(deployerL2Wallet.provider!)).wait()

    // check withdrawals are paused and l2 supply is set in l1 gateway
    expect(await l2USDCCustomGateway.withdrawalsPaused()).to.be.eq(true)
    expect(await l1USDCCustomGateway.l2GatewaySupply()).to.be.gt(0)
    console.log('Withdrawals paused and L2 supply set in L1 gateway')

    /// make circle the burner
    const circleWallet = ethers.Wallet.createRandom().connect(parentProvider)
    await (
      await deployerL1Wallet.sendTransaction({
        to: circleWallet.address,
        value: ethers.utils.parseEther('1'),
      })
    ).wait()
    await (await l1USDCCustomGateway.setBurner(circleWallet.address)).wait()

    /// add minter rights to usdc gateway so it can burn USDC
    await (
      await l1UsdcInit.configureMinter(l1USDCCustomGateway.address, 0)
    ).wait()
    console.log('Minter role with 0 allowance added to L1 USDC gateway')

    /// remove minter role from the L2 gateway
    await (
      await l2UsdcInit
        .connect(masterMinterL2)
        .removeMinter(l2USDCCustomGateway.address)
    ).wait()
    expect(await l2UsdcInit.isMinter(l2USDCCustomGateway.address)).to.be.eq(
      false
    )
    console.log('Minter role removed from L2 USDC gateway')

    /// transfer child chain USDC ownership to circle
    await (await l2UsdcInit.transferOwnership(circleWallet.address)).wait()
    expect(await l2UsdcInit.owner()).to.be.eq(circleWallet.address)
    console.log('L2 USDC ownership transferred to circle')

    /// circle burns USDC on L1
    await (
      await l1USDCCustomGateway.connect(circleWallet).burnLockedUSDC()
    ).wait()
    expect(await l1Usdc.balanceOf(l1USDCCustomGateway.address)).to.be.eq(0)
    expect(await l2Usdc.balanceOf(userL2Wallet.address)).to.be.eq(depositAmount)
    console.log('USDC burned')
  })
})

/**
 * helper function to fund user wallet on L2
 */
async function depositNativeToL2() {
  /// deposit tokens
  const amountToDeposit = ethers.utils.parseEther('2.0')
  await (
    await nativeToken!
      .connect(userL1Wallet)
      .approve(_l2Network.ethBridge.inbox, amountToDeposit)
  ).wait()

  const depositFuncSig = {
    name: 'depositERC20',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
  }
  const inbox = new ethers.Contract(
    _l2Network.ethBridge.inbox,
    [depositFuncSig],
    userL1Wallet
  )

  const depositTx = await inbox.depositERC20(amountToDeposit)

  // wait for deposit to be processed
  const depositRec = await L1TransactionReceipt.monkeyPatchEthDepositWait(
    depositTx
  ).wait()
  await depositRec.waitForL2(childProvider)
}

async function waitOnL2Msg(tx: ethers.ContractTransaction) {
  const retryableReceipt = await tx.wait()
  const l1TxReceipt = new L1TransactionReceipt(retryableReceipt)
  const messages = await l1TxReceipt.getL1ToL2Messages(childProvider)

  // 1 msg expected
  const messageResult = await messages[0].waitForStatus()
  const status = messageResult.status
  expect(status).to.be.eq(L1ToL2MessageStatus.REDEEMED)
}

const getFeeToken = async (inbox: string, parentProvider: any) => {
  const bridge = await IInbox__factory.connect(inbox, parentProvider).bridge()

  let feeToken = ethers.constants.AddressZero

  try {
    feeToken = await IERC20Bridge__factory.connect(
      bridge,
      parentProvider
    ).nativeToken()
  } catch {}

  return feeToken
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function _deployBridgedUsdcToken(deployer: Wallet) {
  /// deploy library
  const sigCheckerLibBytecode =
    '6106cd610026600b82828239805160001a60731461001957fe5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100355760003560e01c80636ccea6521461003a575b600080fd5b6101026004803603606081101561005057600080fd5b73ffffffffffffffffffffffffffffffffffffffff8235169160208101359181019060608101604082013564010000000081111561008d57600080fd5b82018360208201111561009f57600080fd5b803590602001918460018302840111640100000000831117156100c157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610116945050505050565b604080519115158252519081900360200190f35b600061012184610179565b610164578373ffffffffffffffffffffffffffffffffffffffff16610146848461017f565b73ffffffffffffffffffffffffffffffffffffffff16149050610172565b61016f848484610203565b90505b9392505050565b3b151590565b600081516041146101db576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806106296023913960400191505060405180910390fd5b60208201516040830151606084015160001a6101f98682858561042d565b9695505050505050565b60008060608573ffffffffffffffffffffffffffffffffffffffff16631626ba7e60e01b86866040516024018083815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561026f578181015183820152602001610257565b50505050905090810190601f16801561029c5780820380516001836020036101000a031916815260200191505b50604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529181526020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff000000000000000000000000000000000000000000000000000000009098169790971787525181519196909550859450925090508083835b6020831061036957805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0909201916020918201910161032c565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855afa9150503d80600081146103c9576040519150601f19603f3d011682016040523d82523d6000602084013e6103ce565b606091505b50915091508180156103e257506020815110155b80156101f9575080517f1626ba7e00000000000000000000000000000000000000000000000000000000906020808401919081101561042057600080fd5b5051149695505050505050565b60007f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08211156104a8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806106726026913960400191505060405180910390fd5b8360ff16601b141580156104c057508360ff16601c14155b15610516576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602681526020018061064c6026913960400191505060405180910390fd5b600060018686868660405160008152602001604052604051808581526020018460ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015610572573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff811661061f57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f45435265636f7665723a20696e76616c6964207369676e617475726500000000604482015290519081900360640190fd5b9594505050505056fe45435265636f7665723a20696e76616c6964207369676e6174757265206c656e67746845435265636f7665723a20696e76616c6964207369676e6174757265202776272076616c756545435265636f7665723a20696e76616c6964207369676e6174757265202773272076616c7565a2646970667358221220fc883ef3b50f607958f5dc584d21cf2984d25712b89b5e11c0d53a81068ace3664736f6c634300060c0033'
  const sigCheckerFactory = new ethers.ContractFactory(
    [],
    sigCheckerLibBytecode,
    deployer
  )
  const sigCheckerLib = await sigCheckerFactory.deploy()

  // prepare bridged usdc bytecode
  const bytecodeWithPlaceholder: string =
    '0x60806040526001805460ff60a01b191690556000600b553480156200002357600080fd5b506200002f3362000035565b62000057565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b614aec80620000676000396000f3fe608060405234801561001057600080fd5b506004361061036d5760003560e01c80638456cb59116101d3578063b7b7289911610104578063e3ee160e116100a2578063ef55bec61161007c578063ef55bec614610f9c578063f2fde38b14610ffb578063f9f92be414611021578063fe575a87146110475761036d565b8063e3ee160e14610f09578063e5a6b10f14610f68578063e94a010214610f705761036d565b8063d505accf116100de578063d505accf14610e12578063d608ea6414610e63578063d916948714610ed3578063dd62ed3e14610edb5761036d565b8063b7b7289914610c78578063bd10243014610d33578063cf09299514610d3b5761036d565b8063a0cc6a6811610171578063aa20e1e41161014b578063aa20e1e414610bd0578063aa271e1a14610bf6578063ad38bf2214610c1c578063b2118a8d14610c425761036d565b8063a0cc6a6814610b70578063a457c2d714610b78578063a9059cbb14610ba45761036d565b80638da5cb5b116101ad5780638da5cb5b14610a8d57806395d89b4114610a955780639fd0506d14610a9d5780639fd5a6cf14610aa55761036d565b80638456cb591461098857806388b7ab63146109905780638a6db9c314610a675761036d565b806338a63183116102ad57806354fd4d501161024b5780635c975abb116102255780635c975abb1461092c57806370a08231146109345780637ecebe001461095a5780637f2eecc3146109805761036d565b806354fd4d50146108bd578063554bab3c146108c55780635a049a70146108eb5761036d565b806340c10f191161028757806340c10f191461078657806342966c68146107b2578063430239b4146107cf5780634e44d956146108915761036d565b806338a631831461074a57806339509351146107525780633f4ba83a1461077e5761036d565b80632fc81e091161031a578063313ce567116102f4578063313ce567146105215780633357162b1461053f57806335d99f351461071e5780633644e515146107425761036d565b80632fc81e09146104cd5780633092afd5146104f357806330adf81f146105195761036d565b80631a8952661161034b5780631a8952661461044957806323b872dd146104715780632ab60045146104a75761036d565b806306fdde0314610372578063095ea7b3146103ef57806318160ddd1461042f575b600080fd5b61037a61106d565b6040805160208082528351818301528351919283929083019185019080838360005b838110156103b457818101518382015260200161039c565b50505050905090810190601f1680156103e15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61041b6004803603604081101561040557600080fd5b506001600160a01b038135169060200135611119565b604080519115158252519081900360200190f35b61043761118f565b60408051918252519081900360200190f35b61046f6004803603602081101561045f57600080fd5b50356001600160a01b0316611195565b005b61041b6004803603606081101561048757600080fd5b506001600160a01b0381358116916020810135909116906040013561121e565b61046f600480360360208110156104bd57600080fd5b50356001600160a01b031661141f565b61046f600480360360208110156104e357600080fd5b50356001600160a01b0316611525565b61041b6004803603602081101561050957600080fd5b50356001600160a01b031661156f565b610437611616565b61052961163a565b6040805160ff9092168252519081900360200190f35b61046f600480360361010081101561055657600080fd5b81019060208101813564010000000081111561057157600080fd5b82018360208201111561058357600080fd5b803590602001918460018302840111640100000000831117156105a557600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092959493602081019350359150506401000000008111156105f857600080fd5b82018360208201111561060a57600080fd5b8035906020019184600183028401116401000000008311171561062c57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929594936020810193503591505064010000000081111561067f57600080fd5b82018360208201111561069157600080fd5b803590602001918460018302840111640100000000831117156106b357600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295505050813560ff1692505060208101356001600160a01b0390811691604081013582169160608201358116916080013516611643565b610726611882565b604080516001600160a01b039092168252519081900360200190f35b610437611891565b6107266118a0565b61041b6004803603604081101561076857600080fd5b506001600160a01b0381351690602001356118af565b61046f61191c565b61041b6004803603604081101561079c57600080fd5b506001600160a01b0381351690602001356119b8565b61046f600480360360208110156107c857600080fd5b5035611c9b565b61046f600480360360408110156107e557600080fd5b81019060208101813564010000000081111561080057600080fd5b82018360208201111561081257600080fd5b8035906020019184602083028401116401000000008311171561083457600080fd5b91939092909160208101903564010000000081111561085257600080fd5b82018360208201111561086457600080fd5b8035906020019184600183028401116401000000008311171561088657600080fd5b509092509050611eaa565b61041b600480360360408110156108a757600080fd5b506001600160a01b038135169060200135611fe4565b61037a6120fa565b61046f600480360360208110156108db57600080fd5b50356001600160a01b0316612131565b61046f600480360360a081101561090157600080fd5b506001600160a01b038135169060208101359060ff604082013516906060810135906080013561223d565b61041b6122b0565b6104376004803603602081101561094a57600080fd5b50356001600160a01b03166122c0565b6104376004803603602081101561097057600080fd5b50356001600160a01b03166122d1565b6104376122ec565b61046f612310565b61046f600480360360e08110156109a657600080fd5b6001600160a01b03823581169260208101359091169160408201359160608101359160808201359160a08101359181019060e0810160c08201356401000000008111156109f257600080fd5b820183602082011115610a0457600080fd5b80359060200191846001830284011164010000000083111715610a2657600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295506123b2945050505050565b61043760048036036020811015610a7d57600080fd5b50356001600160a01b03166124b7565b6107266124d2565b61037a6124e1565b61072661255a565b61046f600480360360a0811015610abb57600080fd5b6001600160a01b03823581169260208101359091169160408201359160608101359181019060a081016080820135640100000000811115610afb57600080fd5b820183602082011115610b0d57600080fd5b80359060200191846001830284011164010000000083111715610b2f57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550612569945050505050565b6104376125d5565b61041b60048036036040811015610b8e57600080fd5b506001600160a01b0381351690602001356125f9565b61041b60048036036040811015610bba57600080fd5b506001600160a01b038135169060200135612666565b61046f60048036036020811015610be657600080fd5b50356001600160a01b031661276a565b61041b60048036036020811015610c0c57600080fd5b50356001600160a01b0316612876565b61046f60048036036020811015610c3257600080fd5b50356001600160a01b0316612894565b61046f60048036036060811015610c5857600080fd5b506001600160a01b038135811691602081013590911690604001356129a0565b61046f60048036036060811015610c8e57600080fd5b6001600160a01b0382351691602081013591810190606081016040820135640100000000811115610cbe57600080fd5b820183602082011115610cd057600080fd5b80359060200191846001830284011164010000000083111715610cf257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550612a02945050505050565b610726612a6c565b61046f600480360360e0811015610d5157600080fd5b6001600160a01b03823581169260208101359091169160408201359160608101359160808201359160a08101359181019060e0810160c0820135640100000000811115610d9d57600080fd5b820183602082011115610daf57600080fd5b80359060200191846001830284011164010000000083111715610dd157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550612a7b945050505050565b61046f600480360360e0811015610e2857600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060ff6080820135169060a08101359060c00135612b75565b61046f60048036036020811015610e7957600080fd5b810190602081018135640100000000811115610e9457600080fd5b820183602082011115610ea657600080fd5b80359060200191846001830284011164010000000083111715610ec857600080fd5b509092509050612bec565b610437612ca6565b61043760048036036040811015610ef157600080fd5b506001600160a01b0381358116916020013516612cca565b61046f6004803603610120811015610f2057600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060808101359060a08101359060ff60c0820135169060e0810135906101000135612cf5565b61037a612dfe565b61041b60048036036040811015610f8657600080fd5b506001600160a01b038135169060200135612e77565b61046f6004803603610120811015610fb357600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060808101359060a08101359060ff60c0820135169060e0810135906101000135612ea2565b61046f6004803603602081101561101157600080fd5b50356001600160a01b0316612f9e565b61046f6004803603602081101561103757600080fd5b50356001600160a01b0316613096565b61041b6004803603602081101561105d57600080fd5b50356001600160a01b031661311f565b6004805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156111115780601f106110e657610100808354040283529160200191611111565b820191906000526020600020905b8154815290600101906020018083116110f457829003601f168201915b505050505081565b600154600090600160a01b900460ff161561117b576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b61118633848461312a565b50600192915050565b600b5490565b6002546001600160a01b031633146111de5760405162461bcd60e51b815260040180806020018281038252602c815260200180614768602c913960400191505060405180910390fd5b6111e781613216565b6040516001600160a01b038216907f117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e90600090a250565b600154600090600160a01b900460ff1615611280576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b3361128a81613221565b156112c65760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b846112d081613221565b1561130c5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b8461131681613221565b156113525760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b6001600160a01b0387166000908152600a602090815260408083203384529091529020548511156113b45760405162461bcd60e51b81526004018080602001828103825260288152602001806148586028913960400191505060405180910390fd5b6113bf878787613242565b6001600160a01b0387166000908152600a602090815260408083203384529091529020546113ed908661338b565b6001600160a01b0388166000908152600a60209081526040808320338452909152902055600193505050509392505050565b6000546001600160a01b0316331461147e576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166114c35760405162461bcd60e51b815260040180806020018281038252602a8152602001806146a1602a913960400191505060405180910390fd5b600e80547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383169081179091556040517fe475e580d85111348e40d8ca33cfdd74c30fe1655c2d8537a13abc10065ffa5a90600090a250565b60125460ff1660011461153757600080fd5b6000611542306133e8565b9050801561155557611555308383613242565b61155e30613425565b50506012805460ff19166002179055565b6008546000906001600160a01b031633146115bb5760405162461bcd60e51b815260040180806020018281038252602981526020018061473f6029913960400191505060405180910390fd5b6001600160a01b0382166000818152600c60209081526040808320805460ff19169055600d909152808220829055517fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb666929190a2506001919050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b60065460ff1681565b600854600160a01b900460ff161561168c5760405162461bcd60e51b815260040180806020018281038252602a8152602001806148d3602a913960400191505060405180910390fd5b6001600160a01b0384166116d15760405162461bcd60e51b815260040180806020018281038252602f815260200180614805602f913960400191505060405180910390fd5b6001600160a01b0383166117165760405162461bcd60e51b81526004018080602001828103825260298152602001806146786029913960400191505060405180910390fd5b6001600160a01b03821661175b5760405162461bcd60e51b815260040180806020018281038252602e815260200180614880602e913960400191505060405180910390fd5b6001600160a01b0381166117a05760405162461bcd60e51b81526004018080602001828103825260288152602001806149c06028913960400191505060405180910390fd5b87516117b39060049060208b019061442f565b5086516117c79060059060208a019061442f565b5085516117db90600790602089019061442f565b506006805460ff191660ff8716179055600880547fffffffffffffffffffffffff00000000000000000000000000000000000000009081166001600160a01b03878116919091179092556001805482168684161790556002805490911691841691909117905561184a81613430565b5050600880547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff16600160a01b179055505050505050565b6008546001600160a01b031681565b600061189b61346a565b905090565b600e546001600160a01b031690565b600154600090600160a01b900460ff1615611911576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b61118633848461355f565b6001546001600160a01b031633146119655760405162461bcd60e51b81526004018080602001828103825260228152602001806149746022913960400191505060405180910390fd5b600180547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff1690556040517f7805862f689e2f13df9f062ff482ad3ad112aca9e0847911ed832e158c525b3390600090a1565b600154600090600160a01b900460ff1615611a1a576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b336000908152600c602052604090205460ff16611a685760405162461bcd60e51b81526004018080602001828103825260218152602001806147e46021913960400191505060405180910390fd5b33611a7281613221565b15611aae5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b83611ab881613221565b15611af45760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b6001600160a01b038516611b395760405162461bcd60e51b815260040180806020018281038252602381526020018061460d6023913960400191505060405180910390fd5b60008411611b785760405162461bcd60e51b81526004018080602001828103825260298152602001806146f06029913960400191505060405180910390fd5b336000908152600d602052604090205480851115611bc75760405162461bcd60e51b815260040180806020018281038252602e815260200180614946602e913960400191505060405180910390fd5b600b54611bd4908661359c565b600b55611bf386611bee87611be8836133e8565b9061359c565b6135fd565b611bfd818661338b565b336000818152600d602090815260409182902093909355805188815290516001600160a01b038a16937fab8530f87dc9b59234c4623bf917212bb2536d647574c8e7e5da92c2ede0c9f8928290030190a36040805186815290516001600160a01b038816916000917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a350600195945050505050565b600154600160a01b900460ff1615611cfa576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b336000908152600c602052604090205460ff16611d485760405162461bcd60e51b81526004018080602001828103825260218152602001806147e46021913960400191505060405180910390fd5b33611d5281613221565b15611d8e5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b6000611d99336133e8565b905060008311611dda5760405162461bcd60e51b81526004018080602001828103825260298152602001806145e46029913960400191505060405180910390fd5b82811015611e195760405162461bcd60e51b81526004018080602001828103825260268152602001806147be6026913960400191505060405180910390fd5b600b54611e26908461338b565b600b55611e3733611bee838661338b565b60408051848152905133917fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5919081900360200190a260408051848152905160009133917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a3505050565b60125460ff16600214611ebc57600080fd5b611ec8600583836144ad565b5060005b83811015611fab5760036000868684818110611ee457fe5b602090810292909201356001600160a01b03168352508101919091526040016000205460ff16611f455760405162461bcd60e51b815260040180806020018281038252603d815260200180614531603d913960400191505060405180910390fd5b611f69858583818110611f5457fe5b905060200201356001600160a01b0316613425565b60036000868684818110611f7957fe5b602090810292909201356001600160a01b0316835250810191909152604001600020805460ff19169055600101611ecc565b50611fb530613425565b5050306000908152600360208190526040909120805460ff199081169091556012805490911690911790555050565b600154600090600160a01b900460ff1615612046576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b6008546001600160a01b0316331461208f5760405162461bcd60e51b815260040180806020018281038252602981526020018061473f6029913960400191505060405180910390fd5b6001600160a01b0383166000818152600c60209081526040808320805460ff19166001179055600d825291829020859055815185815291517f46980fca912ef9bcdbd36877427b6b90e860769f604e89c0e67720cece530d209281900390910190a250600192915050565b60408051808201909152600181527f3200000000000000000000000000000000000000000000000000000000000000602082015290565b6000546001600160a01b03163314612190576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166121d55760405162461bcd60e51b81526004018080602001828103825260288152602001806145916028913960400191505060405180910390fd5b600180547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383811691909117918290556040519116907fb80482a293ca2e013eda8683c9bd7fc8347cfdaeea5ede58cba46df502c2a60490600090a250565b600154600160a01b900460ff161561229c576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b6122a985858585856136bd565b5050505050565b600154600160a01b900460ff1681565b60006122cb826133e8565b92915050565b6001600160a01b031660009081526011602052604090205490565b7fd099cc98ef71107a616c4f0f941f04c322d8e254fe26b3c6668db87aae413de881565b6001546001600160a01b031633146123595760405162461bcd60e51b81526004018080602001828103825260228152602001806149746022913960400191505060405180910390fd5b600180547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff16600160a01b1790556040517f6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff62590600090a1565b600154600160a01b900460ff1615612411576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b8661241b81613221565b156124575760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b8661246181613221565b1561249d5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b6124ac898989898989896136fd565b505050505050505050565b6001600160a01b03166000908152600d602052604090205490565b6000546001600160a01b031690565b6005805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156111115780601f106110e657610100808354040283529160200191611111565b6001546001600160a01b031681565b600154600160a01b900460ff16156125c8576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b6122a985858585856137ea565b7f7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a226781565b600154600090600160a01b900460ff161561265b576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b611186338484613a60565b600154600090600160a01b900460ff16156126c8576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b336126d281613221565b1561270e5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b8361271881613221565b156127545760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b61275f338686613242565b506001949350505050565b6000546001600160a01b031633146127c9576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b03811661280e5760405162461bcd60e51b815260040180806020018281038252602f815260200180614805602f913960400191505060405180910390fd5b600880547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383811691909117918290556040519116907fdb66dfa9c6b8f5226fe9aac7e51897ae8ee94ac31dc70bb6c9900b2574b707e690600090a250565b6001600160a01b03166000908152600c602052604090205460ff1690565b6000546001600160a01b031633146128f3576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166129385760405162461bcd60e51b8152600401808060200182810382526032815260200180614a166032913960400191505060405180910390fd5b600280547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383811691909117918290556040519116907fc67398012c111ce95ecb7429b933096c977380ee6c421175a71a4a4c6c88c06e90600090a250565b600e546001600160a01b031633146129e95760405162461bcd60e51b81526004018080602001828103825260248152602001806148346024913960400191505060405180910390fd5b6129fd6001600160a01b0384168383613aaf565b505050565b600154600160a01b900460ff1615612a61576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b6129fd838383613b2f565b6002546001600160a01b031681565b600154600160a01b900460ff1615612ada576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b86612ae481613221565b15612b205760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b86612b2a81613221565b15612b665760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b6124ac89898989898989613c01565b600154600160a01b900460ff1615612bd4576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b612be387878787878787613c92565b50505050505050565b600854600160a01b900460ff168015612c08575060125460ff16155b612c1157600080fd5b612c1d600483836144ad565b50612c9282828080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152505060408051808201909152600181527f320000000000000000000000000000000000000000000000000000000000000060208201529150613cd49050565b600f5550506012805460ff19166001179055565b7f158b0a9edf7a828aad02f63cd515c68ef2f50ba807396f6d12842833a159742981565b6001600160a01b039182166000908152600a6020908152604080832093909416825291909152205490565b600154600160a01b900460ff1615612d54576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b88612d5e81613221565b15612d9a5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b88612da481613221565b15612de05760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b612df18b8b8b8b8b8b8b8b8b613cea565b5050505050505050505050565b6007805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156111115780601f106110e657610100808354040283529160200191611111565b6001600160a01b03919091166000908152601060209081526040808320938352929052205460ff1690565b600154600160a01b900460ff1615612f01576040805162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b88612f0b81613221565b15612f475760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b88612f5181613221565b15612f8d5760405162461bcd60e51b8152600401808060200182810382526025815260200180614a486025913960400191505060405180910390fd5b612df18b8b8b8b8b8b8b8b8b613d2e565b6000546001600160a01b03163314612ffd576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b0381166130425760405162461bcd60e51b81526004018080602001828103825260268152602001806146306026913960400191505060405180910390fd5b600054604080516001600160a01b039283168152918316602083015280517f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09281900390910190a161309381613430565b50565b6002546001600160a01b031633146130df5760405162461bcd60e51b815260040180806020018281038252602c815260200180614768602c913960400191505060405180910390fd5b6130e881613425565b6040516001600160a01b038216907fffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b85590600090a250565b60006122cb82613221565b6001600160a01b03831661316f5760405162461bcd60e51b81526004018080602001828103825260248152602001806149226024913960400191505060405180910390fd5b6001600160a01b0382166131b45760405162461bcd60e51b81526004018080602001828103825260228152602001806146566022913960400191505060405180910390fd5b6001600160a01b038084166000818152600a6020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b613093816000613d72565b6001600160a01b031660009081526009602052604090205460ff1c60011490565b6001600160a01b0383166132875760405162461bcd60e51b81526004018080602001828103825260258152602001806148fd6025913960400191505060405180910390fd5b6001600160a01b0382166132cc5760405162461bcd60e51b815260040180806020018281038252602381526020018061456e6023913960400191505060405180910390fd5b6132d5836133e8565b8111156133135760405162461bcd60e51b81526004018080602001828103825260268152602001806147196026913960400191505060405180910390fd5b61332a83611bee83613324876133e8565b9061338b565b61333b82611bee83611be8866133e8565b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000828211156133e2576040805162461bcd60e51b815260206004820152601e60248201527f536166654d6174683a207375627472616374696f6e206f766572666c6f770000604482015290519081900360640190fd5b50900390565b6001600160a01b03166000908152600960205260409020547f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1690565b613093816001613d72565b600080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b6004805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815260009361189b93919290918301828280156135175780601f106134ec57610100808354040283529160200191613517565b820191906000526020600020905b8154815290600101906020018083116134fa57829003601f168201915b50505050506040518060400160405280600181526020017f320000000000000000000000000000000000000000000000000000000000000081525061355a613de1565b613de5565b6001600160a01b038084166000908152600a60209081526040808320938616835292905220546129fd9084908490613597908561359c565b61312a565b6000828201838110156135f6576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b7f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81111561365c5760405162461bcd60e51b815260040180806020018281038252602a815260200180614794602a913960400191505060405180910390fd5b61366582613221565b156136a15760405162461bcd60e51b81526004018080602001828103825260258152602001806146cb6025913960400191505060405180910390fd5b6001600160a01b03909116600090815260096020526040902055565b6122a98585848487604051602001808481526020018381526020018260ff1660f81b81526001019350505050604051602081830303815290604052613b2f565b6001600160a01b03861633146137445760405162461bcd60e51b81526004018080602001828103825260258152602001806148ae6025913960400191505060405180910390fd5b61375087838686613e59565b604080517fd099cc98ef71107a616c4f0f941f04c322d8e254fe26b3c6668db87aae413de86020808301919091526001600160a01b03808b1683850152891660608301526080820188905260a0820187905260c0820186905260e08083018690528351808403909101815261010090920190925280519101206137d590889083613ee5565b6137df878361403c565b612be3878787613242565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214806138185750428210155b613869576040805162461bcd60e51b815260206004820152601e60248201527f46696174546f6b656e56323a207065726d697420697320657870697265640000604482015290519081900360640190fd5b600061390461387661346a565b6001600160a01b0380891660008181526011602090815260409182902080546001810190915582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98184015280840194909452938b166060840152608083018a905260a083019390935260c08083018990528151808403909101815260e090920190528051910120614096565b905073__$715109b5d747ea58b675c6ea3f0dba8c60$__636ccea6528783856040518463ffffffff1660e01b815260040180846001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561398457818101518382015260200161396c565b50505050905090810190601f1680156139b15780820380516001836020036101000a031916815260200191505b5094505050505060206040518083038186803b1580156139d057600080fd5b505af41580156139e4573d6000803e3d6000fd5b505050506040513d60208110156139fa57600080fd5b5051613a4d576040805162461bcd60e51b815260206004820152601a60248201527f454950323631323a20696e76616c6964207369676e6174757265000000000000604482015290519081900360640190fd5b613a5886868661312a565b505050505050565b6129fd838361359784604051806060016040528060258152602001614a92602591396001600160a01b03808a166000908152600a60209081526040808320938c168352929052205491906140d0565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb000000000000000000000000000000000000000000000000000000001790526129fd908490614167565b613b398383614218565b613ba6837f158b0a9edf7a828aad02f63cd515c68ef2f50ba807396f6d12842833a159742960001b858560405160200180848152602001836001600160a01b0316815260200182815260200193505050506040516020818303038152906040528051906020012083613ee5565b6001600160a01b0383166000818152601060209081526040808320868452909152808220805460ff19166001179055518492917f1cdd46ff242716cdaa72d159d339a485b3438398348d68f09d7c8c0a59353d8191a3505050565b613c0d87838686613e59565b604080517f7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a22676020808301919091526001600160a01b03808b1683850152891660608301526080820188905260a0820187905260c0820186905260e08083018690528351808403909101815261010090920190925280519101206137d590889083613ee5565b612be387878787868689604051602001808481526020018381526020018260ff1660f81b815260010193505050506040516020818303038152906040526137ea565b600046613ce2848483613de5565b949350505050565b6124ac89898989898988888b604051602001808481526020018381526020018260ff1660f81b81526001019350505050604051602081830303815290604052613c01565b6124ac89898989898988888b604051602001808481526020018381526020018260ff1660f81b815260010193505050506040516020818303038152906040526136fd565b80613d8557613d80826133e8565b613dc1565b6001600160a01b0382166000908152600960205260409020547f8000000000000000000000000000000000000000000000000000000000000000175b6001600160a01b0390921660009081526009602052604090209190915550565b4690565b8251602093840120825192840192909220604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8187015280820194909452606084019190915260808301919091523060a0808401919091528151808403909101815260c09092019052805191012090565b814211613e975760405162461bcd60e51b815260040180806020018281038252602b8152602001806145b9602b913960400191505060405180910390fd5b804210613ed55760405162461bcd60e51b8152600401808060200182810382526025815260200180614a6d6025913960400191505060405180910390fd5b613edf8484614218565b50505050565b73__$715109b5d747ea58b675c6ea3f0dba8c60$__636ccea65284613f11613f0b61346a565b86614096565b846040518463ffffffff1660e01b815260040180846001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015613f73578181015183820152602001613f5b565b50505050905090810190601f168015613fa05780820380516001836020036101000a031916815260200191505b5094505050505060206040518083038186803b158015613fbf57600080fd5b505af4158015613fd3573d6000803e3d6000fd5b505050506040513d6020811015613fe957600080fd5b50516129fd576040805162461bcd60e51b815260206004820152601e60248201527f46696174546f6b656e56323a20696e76616c6964207369676e61747572650000604482015290519081900360640190fd5b6001600160a01b0382166000818152601060209081526040808320858452909152808220805460ff19166001179055518392917f98de503528ee59b575ef0c0a2576a82497bfc029a5685b209e9ec333479b10a591a35050565b6040517f19010000000000000000000000000000000000000000000000000000000000008152600281019290925260228201526042902090565b6000818484111561415f5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561412457818101518382015260200161410c565b50505050905090810190601f1680156141515780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b60606141bc826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661427f9092919063ffffffff16565b8051909150156129fd578080602001905160208110156141db57600080fd5b50516129fd5760405162461bcd60e51b815260040180806020018281038252602a815260200180614996602a913960400191505060405180910390fd5b6001600160a01b038216600090815260106020908152604080832084845290915290205460ff161561427b5760405162461bcd60e51b815260040180806020018281038252602e8152602001806149e8602e913960400191505060405180910390fd5b5050565b6060613ce2848460008585614293856143c3565b6142e4576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b60006060866001600160a01b031685876040518082805190602001908083835b6020831061434157805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe09092019160209182019101614304565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d80600081146143a3576040519150601f19603f3d011682016040523d82523d6000602084013e6143a8565b606091505b50915091506143b88282866143c9565b979650505050505050565b3b151590565b606083156143d85750816135f6565b8251156143e85782518084602001fd5b60405162461bcd60e51b815260206004820181815284516024840152845185939192839260440191908501908083836000831561412457818101518382015260200161410c565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061447057805160ff191683800117855561449d565b8280016001018555821561449d579182015b8281111561449d578251825591602001919060010190614482565b506144a992915061451b565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106144ee5782800160ff1982351617855561449d565b8280016001018555821561449d579182015b8281111561449d578235825591602001919060010190614500565b5b808211156144a9576000815560010161451c56fe46696174546f6b656e56325f323a20426c61636b6c697374696e672070726576696f75736c7920756e626c61636b6c6973746564206163636f756e742145524332303a207472616e7366657220746f20746865207a65726f20616464726573735061757361626c653a206e65772070617573657220697320746865207a65726f206164647265737346696174546f6b656e56323a20617574686f72697a6174696f6e206973206e6f74207965742076616c696446696174546f6b656e3a206275726e20616d6f756e74206e6f742067726561746572207468616e203046696174546f6b656e3a206d696e7420746f20746865207a65726f20616464726573734f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737346696174546f6b656e3a206e65772070617573657220697320746865207a65726f2061646472657373526573637561626c653a206e6577207265736375657220697320746865207a65726f206164647265737346696174546f6b656e56325f323a204163636f756e7420697320626c61636b6c697374656446696174546f6b656e3a206d696e7420616d6f756e74206e6f742067726561746572207468616e203045524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636546696174546f6b656e3a2063616c6c6572206973206e6f7420746865206d61737465724d696e746572426c61636b6c69737461626c653a2063616c6c6572206973206e6f742074686520626c61636b6c697374657246696174546f6b656e56325f323a2042616c616e636520657863656564732028325e323535202d20312946696174546f6b656e3a206275726e20616d6f756e7420657863656564732062616c616e636546696174546f6b656e3a2063616c6c6572206973206e6f742061206d696e74657246696174546f6b656e3a206e6577206d61737465724d696e74657220697320746865207a65726f2061646472657373526573637561626c653a2063616c6c6572206973206e6f7420746865207265736375657245524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636546696174546f6b656e3a206e657720626c61636b6c697374657220697320746865207a65726f206164647265737346696174546f6b656e56323a2063616c6c6572206d7573742062652074686520706179656546696174546f6b656e3a20636f6e747261637420697320616c726561647920696e697469616c697a656445524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737346696174546f6b656e3a206d696e7420616d6f756e742065786365656473206d696e746572416c6c6f77616e63655061757361626c653a2063616c6c6572206973206e6f7420746865207061757365725361666545524332303a204552433230206f7065726174696f6e20646964206e6f74207375636365656446696174546f6b656e3a206e6577206f776e657220697320746865207a65726f206164647265737346696174546f6b656e56323a20617574686f72697a6174696f6e2069732075736564206f722063616e63656c6564426c61636b6c69737461626c653a206e657720626c61636b6c697374657220697320746865207a65726f2061646472657373426c61636b6c69737461626c653a206163636f756e7420697320626c61636b6c697374656446696174546f6b656e56323a20617574686f72697a6174696f6e206973206578706972656445524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa26469706673582212206b5e166c9bb86d4031d11482d2bd231c0f948b4d47fe27594c561c1db6a6c61364736f6c634300060c0033'
  const placeholder = '__$715109b5d747ea58b675c6ea3f0dba8c60$__'

  const libAddressStripped = sigCheckerLib.address.replace(/^0x/, '')
  const bridgedUsdcLogicBytecode = bytecodeWithPlaceholder
    .split(placeholder)
    .join(libAddressStripped)

  // deploy bridged usdc logic
  const bridgedUsdcLogicFactory = new ethers.ContractFactory(
    [],
    bridgedUsdcLogicBytecode,
    deployer
  )
  const bridgedUsdcLogic = await bridgedUsdcLogicFactory.deploy()

  return bridgedUsdcLogic
}
