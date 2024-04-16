import { ethers } from 'hardhat'
import { run } from 'hardhat'
import { L1AtomicTokenBridgeCreator__factory } from '../build/types'
import { Provider } from '@ethersproject/providers'

main().then(() => console.log('Done.'))

async function main() {
  const parentRpcUrl = process.env['PARENT_RPC'] as string
  const tokenBridgeCreatorAddress = process.env[
    'TOKEN_BRIDGE_CREATOR'
  ] as string
  const inboxAddress = process.env['INBOX_ADDRESS'] as string
  if (!parentRpcUrl || !tokenBridgeCreatorAddress || !inboxAddress) {
    throw new Error(
      'Missing required environment variables PARENT_RPC, L1_TOKEN_BRIDGE_CREATOR and INBOX_ADDRESS'
    )
  }

  const parentProvider = new ethers.providers.JsonRpcProvider(parentRpcUrl)
  const tokenBridgeCreator = L1AtomicTokenBridgeCreator__factory.connect(
    tokenBridgeCreatorAddress,
    parentProvider
  )
  const l2Factory = await tokenBridgeCreator.canonicalL2FactoryAddress()
  const l2Deployment = await tokenBridgeCreator.inboxToL2Deployment(
    inboxAddress
  )

  console.log(
    'Start verification of token bridge contracts deployed to chain',
    (await parentProvider.getNetwork()).chainId
  )

  await verifyContract('L2AtomicTokenBridgeFactory', l2Factory, [])

  await verifyContract(
    'L2ERC20Gateway',
    await _getLogicAddress(l2Deployment.standardGateway, parentProvider),
    []
  )
  await verifyContract(
    'L2CustomGateway',
    await _getLogicAddress(l2Deployment.customGateway, parentProvider),
    []
  )
  await verifyContract(
    'L2GatewayRouter',
    await _getLogicAddress(l2Deployment.router, parentProvider),
    []
  )
}

async function verifyContract(
  contractName: string,
  contractAddress: string,
  constructorArguments: any[] = [],
  contractPathAndName?: string // optional
): Promise<void> {
  try {
    // Define the verification options with possible 'contract' property
    const verificationOptions: {
      contract?: string
      address: string
      constructorArguments: any[]
    } = {
      address: contractAddress,
      constructorArguments: constructorArguments,
    }

    // if contractPathAndName is provided, add it to the verification options
    if (contractPathAndName) {
      verificationOptions.contract = contractPathAndName
    }

    await run('verify:verify', verificationOptions)
    console.log(`Verified contract ${contractName} successfully.`)
  } catch (error: any) {
    if (error.message.includes('Already Verified')) {
      console.log(`Contract ${contractName} is already verified.`)
    } else {
      console.error(
        `Verification for ${contractName} failed with the following error: ${error.message}`
      )
    }
  }
}

async function _getLogicAddress(
  contractAddress: string,
  provider: Provider
): Promise<string> {
  return (
    await _getAddressAtStorageSlot(
      contractAddress,
      provider,
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    )
  ).toLowerCase()
}

async function _getAddressAtStorageSlot(
  contractAddress: string,
  provider: Provider,
  storageSlotBytes: string
): Promise<string> {
  const storageValue = await provider.getStorageAt(
    contractAddress,
    storageSlotBytes
  )

  if (!storageValue) {
    return ''
  }

  // remove excess bytes
  const formatAddress =
    storageValue.substring(0, 2) + storageValue.substring(26)

  // return address as checksum address
  return ethers.utils.getAddress(formatAddress)
}
