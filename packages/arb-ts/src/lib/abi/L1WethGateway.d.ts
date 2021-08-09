/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from 'ethers'
import {
  Contract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from '@ethersproject/contracts'
import { BytesLike } from '@ethersproject/bytes'
import { Listener, Provider } from '@ethersproject/providers'
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi'

interface L1WethGatewayInterface extends ethers.utils.Interface {
  functions: {
    'calculateL2TokenAddress(address)': FunctionFragment
    'counterpartGateway()': FunctionFragment
    'encodeWithdrawal(uint256,address)': FunctionFragment
    'finalizeInboundTransfer(address,address,address,uint256,bytes)': FunctionFragment
    'gasReserveIfCallRevert()': FunctionFragment
    'getExternalCall(uint256,address,bytes)': FunctionFragment
    'getOutboundCalldata(address,address,address,uint256,bytes)': FunctionFragment
    'inboundEscrowAndCall(address,uint256,address,address,bytes)': FunctionFragment
    'inbox()': FunctionFragment
    'initialize(address,address,address,address,address)': FunctionFragment
    'l1Weth()': FunctionFragment
    'l2Weth()': FunctionFragment
    'outboundTransfer(address,address,uint256,uint256,uint256,bytes)': FunctionFragment
    'parseInboundData(bytes)': FunctionFragment
    'postUpgradeInit()': FunctionFragment
    'redirectedExits(bytes32)': FunctionFragment
    'router()': FunctionFragment
    'transferExitAndCall(uint256,address,address,bytes,bytes)': FunctionFragment
  }

  encodeFunctionData(
    functionFragment: 'calculateL2TokenAddress',
    values: [string]
  ): string
  encodeFunctionData(
    functionFragment: 'counterpartGateway',
    values?: undefined
  ): string
  encodeFunctionData(
    functionFragment: 'encodeWithdrawal',
    values: [BigNumberish, string]
  ): string
  encodeFunctionData(
    functionFragment: 'finalizeInboundTransfer',
    values: [string, string, string, BigNumberish, BytesLike]
  ): string
  encodeFunctionData(
    functionFragment: 'gasReserveIfCallRevert',
    values?: undefined
  ): string
  encodeFunctionData(
    functionFragment: 'getExternalCall',
    values: [BigNumberish, string, BytesLike]
  ): string
  encodeFunctionData(
    functionFragment: 'getOutboundCalldata',
    values: [string, string, string, BigNumberish, BytesLike]
  ): string
  encodeFunctionData(
    functionFragment: 'inboundEscrowAndCall',
    values: [string, BigNumberish, string, string, BytesLike]
  ): string
  encodeFunctionData(functionFragment: 'inbox', values?: undefined): string
  encodeFunctionData(
    functionFragment: 'initialize',
    values: [string, string, string, string, string]
  ): string
  encodeFunctionData(functionFragment: 'l1Weth', values?: undefined): string
  encodeFunctionData(functionFragment: 'l2Weth', values?: undefined): string
  encodeFunctionData(
    functionFragment: 'outboundTransfer',
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike
    ]
  ): string
  encodeFunctionData(
    functionFragment: 'parseInboundData',
    values: [BytesLike]
  ): string
  encodeFunctionData(
    functionFragment: 'postUpgradeInit',
    values?: undefined
  ): string
  encodeFunctionData(
    functionFragment: 'redirectedExits',
    values: [BytesLike]
  ): string
  encodeFunctionData(functionFragment: 'router', values?: undefined): string
  encodeFunctionData(
    functionFragment: 'transferExitAndCall',
    values: [BigNumberish, string, string, BytesLike, BytesLike]
  ): string

  decodeFunctionResult(
    functionFragment: 'calculateL2TokenAddress',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'counterpartGateway',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'encodeWithdrawal',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'finalizeInboundTransfer',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'gasReserveIfCallRevert',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'getExternalCall',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'getOutboundCalldata',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'inboundEscrowAndCall',
    data: BytesLike
  ): Result
  decodeFunctionResult(functionFragment: 'inbox', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'l1Weth', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'l2Weth', data: BytesLike): Result
  decodeFunctionResult(
    functionFragment: 'outboundTransfer',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'parseInboundData',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'postUpgradeInit',
    data: BytesLike
  ): Result
  decodeFunctionResult(
    functionFragment: 'redirectedExits',
    data: BytesLike
  ): Result
  decodeFunctionResult(functionFragment: 'router', data: BytesLike): Result
  decodeFunctionResult(
    functionFragment: 'transferExitAndCall',
    data: BytesLike
  ): Result

  events: {
    'InboundTransferFinalized(address,address,address,uint256,uint256,bytes)': EventFragment
    'OutboundTransferInitiated(address,address,address,uint256,uint256,bytes)': EventFragment
    'TransferAndCallTriggered(bool,address,address,uint256,bytes)': EventFragment
    'TxToL2(address,address,uint256,bytes)': EventFragment
    'WithdrawRedirected(address,address,uint256,bytes,bytes,bool)': EventFragment
  }

  getEvent(nameOrSignatureOrTopic: 'InboundTransferFinalized'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'OutboundTransferInitiated'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'TransferAndCallTriggered'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'TxToL2'): EventFragment
  getEvent(nameOrSignatureOrTopic: 'WithdrawRedirected'): EventFragment
}

export class L1WethGateway extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this
  attach(addressOrName: string): this
  deployed(): Promise<this>

  on(event: EventFilter | string, listener: Listener): this
  once(event: EventFilter | string, listener: Listener): this
  addListener(eventName: EventFilter | string, listener: Listener): this
  removeAllListeners(eventName: EventFilter | string): this
  removeListener(eventName: any, listener: Listener): this

  interface: L1WethGatewayInterface

  functions: {
    calculateL2TokenAddress(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<[string]>

    'calculateL2TokenAddress(address)'(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<[string]>

    counterpartGateway(overrides?: CallOverrides): Promise<[string]>

    'counterpartGateway()'(overrides?: CallOverrides): Promise<[string]>

    encodeWithdrawal(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<[string]>

    'encodeWithdrawal(uint256,address)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<[string]>

    finalizeInboundTransfer(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>

    'finalizeInboundTransfer(address,address,address,uint256,bytes)'(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>

    gasReserveIfCallRevert(overrides?: CallOverrides): Promise<[BigNumber]>

    'gasReserveIfCallRevert()'(overrides?: CallOverrides): Promise<[BigNumber]>

    getExternalCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { target: string; data: string }>

    'getExternalCall(uint256,address,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { target: string; data: string }>

    getOutboundCalldata(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string] & { outboundCalldata: string }>

    'getOutboundCalldata(address,address,address,uint256,bytes)'(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string] & { outboundCalldata: string }>

    inboundEscrowAndCall(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>

    'inboundEscrowAndCall(address,uint256,address,address,bytes)'(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>

    inbox(overrides?: CallOverrides): Promise<[string]>

    'inbox()'(overrides?: CallOverrides): Promise<[string]>

    initialize(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>

    'initialize(address,address,address,address,address)'(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>

    l1Weth(overrides?: CallOverrides): Promise<[string]>

    'l1Weth()'(overrides?: CallOverrides): Promise<[string]>

    l2Weth(overrides?: CallOverrides): Promise<[string]>

    'l2Weth()'(overrides?: CallOverrides): Promise<[string]>

    outboundTransfer(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>

    'outboundTransfer(address,address,uint256,uint256,uint256,bytes)'(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>

    parseInboundData(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string] & { _exitNum: BigNumber; _extraData: string }
    >

    'parseInboundData(bytes)'(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string] & { _exitNum: BigNumber; _extraData: string }
    >

    postUpgradeInit(overrides?: Overrides): Promise<ContractTransaction>

    'postUpgradeInit()'(overrides?: Overrides): Promise<ContractTransaction>

    redirectedExits(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { _newTo: string; _newData: string }>

    'redirectedExits(bytes32)'(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { _newTo: string; _newData: string }>

    router(overrides?: CallOverrides): Promise<[string]>

    'router()'(overrides?: CallOverrides): Promise<[string]>

    transferExitAndCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>

    'transferExitAndCall(uint256,address,address,bytes,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>
  }

  calculateL2TokenAddress(
    l1ERC20: string,
    overrides?: CallOverrides
  ): Promise<string>

  'calculateL2TokenAddress(address)'(
    l1ERC20: string,
    overrides?: CallOverrides
  ): Promise<string>

  counterpartGateway(overrides?: CallOverrides): Promise<string>

  'counterpartGateway()'(overrides?: CallOverrides): Promise<string>

  encodeWithdrawal(
    _exitNum: BigNumberish,
    _initialDestination: string,
    overrides?: CallOverrides
  ): Promise<string>

  'encodeWithdrawal(uint256,address)'(
    _exitNum: BigNumberish,
    _initialDestination: string,
    overrides?: CallOverrides
  ): Promise<string>

  finalizeInboundTransfer(
    _token: string,
    _from: string,
    _to: string,
    _amount: BigNumberish,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>

  'finalizeInboundTransfer(address,address,address,uint256,bytes)'(
    _token: string,
    _from: string,
    _to: string,
    _amount: BigNumberish,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>

  gasReserveIfCallRevert(overrides?: CallOverrides): Promise<BigNumber>

  'gasReserveIfCallRevert()'(overrides?: CallOverrides): Promise<BigNumber>

  getExternalCall(
    _exitNum: BigNumberish,
    _initialDestination: string,
    _initialData: BytesLike,
    overrides?: CallOverrides
  ): Promise<[string, string] & { target: string; data: string }>

  'getExternalCall(uint256,address,bytes)'(
    _exitNum: BigNumberish,
    _initialDestination: string,
    _initialData: BytesLike,
    overrides?: CallOverrides
  ): Promise<[string, string] & { target: string; data: string }>

  getOutboundCalldata(
    _l1Token: string,
    _from: string,
    _to: string,
    _amount: BigNumberish,
    _data: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>

  'getOutboundCalldata(address,address,address,uint256,bytes)'(
    _l1Token: string,
    _from: string,
    _to: string,
    _amount: BigNumberish,
    _data: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>

  inboundEscrowAndCall(
    _l2Address: string,
    _amount: BigNumberish,
    _from: string,
    _to: string,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  'inboundEscrowAndCall(address,uint256,address,address,bytes)'(
    _l2Address: string,
    _amount: BigNumberish,
    _from: string,
    _to: string,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  inbox(overrides?: CallOverrides): Promise<string>

  'inbox()'(overrides?: CallOverrides): Promise<string>

  initialize(
    _l1Counterpart: string,
    _l1Router: string,
    _inbox: string,
    _l1Weth: string,
    _l2Weth: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  'initialize(address,address,address,address,address)'(
    _l1Counterpart: string,
    _l1Router: string,
    _inbox: string,
    _l1Weth: string,
    _l2Weth: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  l1Weth(overrides?: CallOverrides): Promise<string>

  'l1Weth()'(overrides?: CallOverrides): Promise<string>

  l2Weth(overrides?: CallOverrides): Promise<string>

  'l2Weth()'(overrides?: CallOverrides): Promise<string>

  outboundTransfer(
    _l1Token: string,
    _to: string,
    _amount: BigNumberish,
    _maxGas: BigNumberish,
    _gasPriceBid: BigNumberish,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>

  'outboundTransfer(address,address,uint256,uint256,uint256,bytes)'(
    _l1Token: string,
    _to: string,
    _amount: BigNumberish,
    _maxGas: BigNumberish,
    _gasPriceBid: BigNumberish,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>

  parseInboundData(
    _data: BytesLike,
    overrides?: CallOverrides
  ): Promise<[BigNumber, string] & { _exitNum: BigNumber; _extraData: string }>

  'parseInboundData(bytes)'(
    _data: BytesLike,
    overrides?: CallOverrides
  ): Promise<[BigNumber, string] & { _exitNum: BigNumber; _extraData: string }>

  postUpgradeInit(overrides?: Overrides): Promise<ContractTransaction>

  'postUpgradeInit()'(overrides?: Overrides): Promise<ContractTransaction>

  redirectedExits(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<[string, string] & { _newTo: string; _newData: string }>

  'redirectedExits(bytes32)'(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<[string, string] & { _newTo: string; _newData: string }>

  router(overrides?: CallOverrides): Promise<string>

  'router()'(overrides?: CallOverrides): Promise<string>

  transferExitAndCall(
    _exitNum: BigNumberish,
    _initialDestination: string,
    _newDestination: string,
    _newData: BytesLike,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  'transferExitAndCall(uint256,address,address,bytes,bytes)'(
    _exitNum: BigNumberish,
    _initialDestination: string,
    _newDestination: string,
    _newData: BytesLike,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  callStatic: {
    calculateL2TokenAddress(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<string>

    'calculateL2TokenAddress(address)'(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<string>

    counterpartGateway(overrides?: CallOverrides): Promise<string>

    'counterpartGateway()'(overrides?: CallOverrides): Promise<string>

    encodeWithdrawal(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<string>

    'encodeWithdrawal(uint256,address)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<string>

    finalizeInboundTransfer(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    'finalizeInboundTransfer(address,address,address,uint256,bytes)'(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    gasReserveIfCallRevert(overrides?: CallOverrides): Promise<BigNumber>

    'gasReserveIfCallRevert()'(overrides?: CallOverrides): Promise<BigNumber>

    getExternalCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { target: string; data: string }>

    'getExternalCall(uint256,address,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { target: string; data: string }>

    getOutboundCalldata(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    'getOutboundCalldata(address,address,address,uint256,bytes)'(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    inboundEscrowAndCall(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>

    'inboundEscrowAndCall(address,uint256,address,address,bytes)'(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>

    inbox(overrides?: CallOverrides): Promise<string>

    'inbox()'(overrides?: CallOverrides): Promise<string>

    initialize(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: CallOverrides
    ): Promise<void>

    'initialize(address,address,address,address,address)'(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: CallOverrides
    ): Promise<void>

    l1Weth(overrides?: CallOverrides): Promise<string>

    'l1Weth()'(overrides?: CallOverrides): Promise<string>

    l2Weth(overrides?: CallOverrides): Promise<string>

    'l2Weth()'(overrides?: CallOverrides): Promise<string>

    outboundTransfer(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    'outboundTransfer(address,address,uint256,uint256,uint256,bytes)'(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>

    parseInboundData(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string] & { _exitNum: BigNumber; _extraData: string }
    >

    'parseInboundData(bytes)'(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string] & { _exitNum: BigNumber; _extraData: string }
    >

    postUpgradeInit(overrides?: CallOverrides): Promise<void>

    'postUpgradeInit()'(overrides?: CallOverrides): Promise<void>

    redirectedExits(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { _newTo: string; _newData: string }>

    'redirectedExits(bytes32)'(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string, string] & { _newTo: string; _newData: string }>

    router(overrides?: CallOverrides): Promise<string>

    'router()'(overrides?: CallOverrides): Promise<string>

    transferExitAndCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>

    'transferExitAndCall(uint256,address,address,bytes,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>
  }

  filters: {
    InboundTransferFinalized(
      token: null,
      _from: string | null,
      _to: string | null,
      _transferId: BigNumberish | null,
      _amount: null,
      _data: null
    ): EventFilter

    OutboundTransferInitiated(
      token: null,
      _from: string | null,
      _to: string | null,
      _transferId: BigNumberish | null,
      _amount: null,
      _data: null
    ): EventFilter

    TransferAndCallTriggered(
      success: null,
      _from: string | null,
      _to: string | null,
      _amount: null,
      callHookData: null
    ): EventFilter

    TxToL2(
      _from: string | null,
      _to: string | null,
      _seqNum: BigNumberish | null,
      _data: null
    ): EventFilter

    WithdrawRedirected(
      from: string | null,
      to: string | null,
      exitNum: BigNumberish | null,
      newData: null,
      data: null,
      madeExternalCall: null
    ): EventFilter
  }

  estimateGas: {
    calculateL2TokenAddress(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'calculateL2TokenAddress(address)'(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    counterpartGateway(overrides?: CallOverrides): Promise<BigNumber>

    'counterpartGateway()'(overrides?: CallOverrides): Promise<BigNumber>

    encodeWithdrawal(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'encodeWithdrawal(uint256,address)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    finalizeInboundTransfer(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>

    'finalizeInboundTransfer(address,address,address,uint256,bytes)'(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>

    gasReserveIfCallRevert(overrides?: CallOverrides): Promise<BigNumber>

    'gasReserveIfCallRevert()'(overrides?: CallOverrides): Promise<BigNumber>

    getExternalCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'getExternalCall(uint256,address,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    getOutboundCalldata(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'getOutboundCalldata(address,address,address,uint256,bytes)'(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    inboundEscrowAndCall(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>

    'inboundEscrowAndCall(address,uint256,address,address,bytes)'(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>

    inbox(overrides?: CallOverrides): Promise<BigNumber>

    'inbox()'(overrides?: CallOverrides): Promise<BigNumber>

    initialize(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<BigNumber>

    'initialize(address,address,address,address,address)'(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<BigNumber>

    l1Weth(overrides?: CallOverrides): Promise<BigNumber>

    'l1Weth()'(overrides?: CallOverrides): Promise<BigNumber>

    l2Weth(overrides?: CallOverrides): Promise<BigNumber>

    'l2Weth()'(overrides?: CallOverrides): Promise<BigNumber>

    outboundTransfer(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>

    'outboundTransfer(address,address,uint256,uint256,uint256,bytes)'(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>

    parseInboundData(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'parseInboundData(bytes)'(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    postUpgradeInit(overrides?: Overrides): Promise<BigNumber>

    'postUpgradeInit()'(overrides?: Overrides): Promise<BigNumber>

    redirectedExits(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'redirectedExits(bytes32)'(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    router(overrides?: CallOverrides): Promise<BigNumber>

    'router()'(overrides?: CallOverrides): Promise<BigNumber>

    transferExitAndCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>

    'transferExitAndCall(uint256,address,address,bytes,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>
  }

  populateTransaction: {
    calculateL2TokenAddress(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'calculateL2TokenAddress(address)'(
      l1ERC20: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    counterpartGateway(overrides?: CallOverrides): Promise<PopulatedTransaction>

    'counterpartGateway()'(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    encodeWithdrawal(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'encodeWithdrawal(uint256,address)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    finalizeInboundTransfer(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>

    'finalizeInboundTransfer(address,address,address,uint256,bytes)'(
      _token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>

    gasReserveIfCallRevert(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'gasReserveIfCallRevert()'(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    getExternalCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'getExternalCall(uint256,address,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _initialData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    getOutboundCalldata(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'getOutboundCalldata(address,address,address,uint256,bytes)'(
      _l1Token: string,
      _from: string,
      _to: string,
      _amount: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    inboundEscrowAndCall(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>

    'inboundEscrowAndCall(address,uint256,address,address,bytes)'(
      _l2Address: string,
      _amount: BigNumberish,
      _from: string,
      _to: string,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>

    inbox(overrides?: CallOverrides): Promise<PopulatedTransaction>

    'inbox()'(overrides?: CallOverrides): Promise<PopulatedTransaction>

    initialize(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>

    'initialize(address,address,address,address,address)'(
      _l1Counterpart: string,
      _l1Router: string,
      _inbox: string,
      _l1Weth: string,
      _l2Weth: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>

    l1Weth(overrides?: CallOverrides): Promise<PopulatedTransaction>

    'l1Weth()'(overrides?: CallOverrides): Promise<PopulatedTransaction>

    l2Weth(overrides?: CallOverrides): Promise<PopulatedTransaction>

    'l2Weth()'(overrides?: CallOverrides): Promise<PopulatedTransaction>

    outboundTransfer(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>

    'outboundTransfer(address,address,uint256,uint256,uint256,bytes)'(
      _l1Token: string,
      _to: string,
      _amount: BigNumberish,
      _maxGas: BigNumberish,
      _gasPriceBid: BigNumberish,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>

    parseInboundData(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'parseInboundData(bytes)'(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    postUpgradeInit(overrides?: Overrides): Promise<PopulatedTransaction>

    'postUpgradeInit()'(overrides?: Overrides): Promise<PopulatedTransaction>

    redirectedExits(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'redirectedExits(bytes32)'(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>

    'router()'(overrides?: CallOverrides): Promise<PopulatedTransaction>

    transferExitAndCall(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>

    'transferExitAndCall(uint256,address,address,bytes,bytes)'(
      _exitNum: BigNumberish,
      _initialDestination: string,
      _newDestination: string,
      _newData: BytesLike,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>
  }
}
