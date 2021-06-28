/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from 'ethers'
import { Provider, TransactionRequest } from '@ethersproject/providers'
import { Contract, ContractFactory, Overrides } from '@ethersproject/contracts'

import type { L2CustomGateway } from '../L2CustomGateway'

export class L2CustomGateway__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer)
  }

  deploy(overrides?: Overrides): Promise<L2CustomGateway> {
    return super.deploy(overrides || {}) as Promise<L2CustomGateway>
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {})
  }
  attach(address: string): L2CustomGateway {
    return super.attach(address) as L2CustomGateway
  }
  connect(signer: Signer): L2CustomGateway__factory {
    return super.connect(signer) as L2CustomGateway__factory
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): L2CustomGateway {
    return new Contract(address, _abi, signerOrProvider) as L2CustomGateway
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_transferId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'InboundTransferFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_transferId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'OutboundTransferInitiated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'l1Address',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'l2Address',
        type: 'address',
      },
    ],
    name: 'TokenSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'success',
        type: 'bool',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'callHookData',
        type: 'bytes',
      },
    ],
    name: 'TransferAndCallTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'TxToL1',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'l1ERC20',
        type: 'address',
      },
    ],
    name: 'calculateL2TokenAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'counterpartGateway',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exitNum',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'finalizeInboundTransfer',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gasReserveIfCallRevert',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'getOutboundCalldata',
    outputs: [
      {
        internalType: 'bytes',
        name: 'outboundCalldata',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l2Address',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'inboundEscrowAndCall',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l1Counterpart',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_router',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'l1ToL2Token',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l1Token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'outboundTransfer',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l1Token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_maxGas',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_gasPriceBid',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'outboundTransfer',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'postUpgradeInit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'l1Address',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'l2Address',
        type: 'address[]',
      },
    ],
    name: 'registerTokenFromL1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'router',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

const _bytecode =
  '0x608060405234801561001057600080fd5b50611a30806100206000396000f3fe6080604052600436106100bc5760003560e01c80638a2dc0141161006f5780638a2dc014146103db57806395fcea781461040e578063a0c76a9614610423578063a7e28d48146104fc578063d2ce7d651461052f578063d4f5532f146105c9578063f887ea4014610694576100bc565b8062aa3a9b146100c1578063015234ab1461019a5780630f09eb51146101c15780632db09c1c146101d65780632e567b3614610207578063485cc955146103125780637b3a3c8b1461034d575b600080fd5b3480156100cd57600080fd5b50610198600480360360a08110156100e457600080fd5b6001600160a01b0382358116926020810135926040820135831692606083013516919081019060a081016080820135600160201b81111561012457600080fd5b82018360208201111561013657600080fd5b803590602001918460018302840111600160201b8311171561015757600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295506106a9945050505050565b005b3480156101a657600080fd5b506101af6108a3565b60408051918252519081900360200190f35b3480156101cd57600080fd5b506101af6108a9565b3480156101e257600080fd5b506101eb6108af565b604080516001600160a01b039092168252519081900360200190f35b61029d600480360360a081101561021d57600080fd5b6001600160a01b03823581169260208101358216926040820135909216916060820135919081019060a081016080820135600160201b81111561025f57600080fd5b82018360208201111561027157600080fd5b803590602001918460018302840111600160201b8311171561029257600080fd5b5090925090506108be565b6040805160208082528351818301528351919283929083019185019080838360005b838110156102d75781810151838201526020016102bf565b50505050905090810190601f1680156103045780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561031e57600080fd5b506101986004803603604081101561033557600080fd5b506001600160a01b0381358116916020013516610eb2565b61029d6004803603608081101561036357600080fd5b6001600160a01b03823581169260208101359091169160408201359190810190608081016060820135600160201b81111561039d57600080fd5b8201836020820111156103af57600080fd5b803590602001918460018302840111600160201b831117156103d057600080fd5b509092509050610ec0565b3480156103e757600080fd5b506101eb600480360360208110156103fe57600080fd5b50356001600160a01b0316610ed2565b34801561041a57600080fd5b50610198610eed565b34801561042f57600080fd5b5061029d600480360360a081101561044657600080fd5b6001600160a01b03823581169260208101358216926040820135909216916060820135919081019060a081016080820135600160201b81111561048857600080fd5b82018360208201111561049a57600080fd5b803590602001918460018302840111600160201b831117156104bb57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610f62945050505050565b34801561050857600080fd5b506101eb6004803603602081101561051f57600080fd5b50356001600160a01b03166110d9565b61029d600480360360c081101561054557600080fd5b6001600160a01b0382358116926020810135909116916040820135916060810135916080820135919081019060c0810160a0820135600160201b81111561058b57600080fd5b82018360208201111561059d57600080fd5b803590602001918460018302840111600160201b831117156105be57600080fd5b5090925090506110ea565b3480156105d557600080fd5b50610198600480360360408110156105ec57600080fd5b810190602081018135600160201b81111561060657600080fd5b82018360208201111561061857600080fd5b803590602001918460208302840111600160201b8311171561063957600080fd5b919390929091602081019035600160201b81111561065657600080fd5b82018360208201111561066857600080fd5b803590602001918460208302840111600160201b8311171561068957600080fd5b5090925090506112fd565b3480156106a057600080fd5b506101eb611462565b3330146106fd576040805162461bcd60e51b815260206004820152601f60248201527f4d696e742063616e206f6e6c792062652063616c6c65642062792073656c6600604482015290519081900360640190fd5b61070f826001600160a01b0316611471565b610760576040805162461bcd60e51b815260206004820152601e60248201527f44657374696e6174696f6e206d757374206265206120636f6e74726163740000604482015290519081900360640190fd5b61076b858386611477565b60006107756108a9565b5a039050805a116107b75760405162461bcd60e51b815260040180806020018281038252602b8152602001806119d0602b913960400191505060405180910390fd5b826001600160a01b031663a4c0ed36828688866040518563ffffffff1660e01b815260040180846001600160a01b03166001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561083457818101518382015260200161081c565b50505050905090810190601f1680156108615780820380516001836020036101000a031916815260200191505b50945050505050600060405180830381600088803b15801561088257600080fd5b5087f1158015610896573d6000803e3d6000fd5b5050505050505050505050565b60025481565b6109c490565b6000546001600160a01b031681565b60606108c9336114f4565b610915576040805162461bcd60e51b81526020600482015260186024820152774f4e4c595f434f554e544552504152545f4741544557415960401b604482015290519081900360640190fd5b6060808484604081101561092857600080fd5b810190602081018135600160201b81111561094257600080fd5b82018360208201111561095457600080fd5b803590602001918460018302840111600160201b8311171561097557600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156109c757600080fd5b8201836020820111156109d957600080fd5b803590602001918460018302840111600160201b831117156109fa57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920182905250979950929750610a4495508f94506115089350505050565b9050610a58816001600160a01b0316611471565b610a91576000610a6c8b838c8c8c89611526565b90508015610a8f5760405180602001604052806000815250945050505050610ea8565b505b60408051600481526024810182526020810180516001600160e01b031663c2eeeebd60e01b178152915181516000936060936001600160a01b038716939092909182918083835b60208310610af75780518252601f199092019160209182019101610ad8565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855afa9150503d8060008114610b57576040519150601f19603f3d011682016040523d82523d6000602084013e610b5c565b606091505b50915091506000821580610b71575060208251105b15610b7e57506001610bad565b6000610b8b83600c611552565b90508d6001600160a01b0316816001600160a01b031614610bab57600191505b505b8015610bed57610bcf8d308e8d604051806020016040528060008152506115b2565b50604051806020016040528060008152509650505050505050610ea8565b50508251159050610de7576000306001600160a01b031662aa3a9b838a8d8d886040518663ffffffff1660e01b815260040180866001600160a01b03166001600160a01b03168152602001858152602001846001600160a01b03166001600160a01b03168152602001836001600160a01b03166001600160a01b0316815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610ca7578181015183820152602001610c8f565b50505050905090810190601f168015610cd45780820380516001836020036101000a031916815260200191505b509650505050505050600060405180830381600087803b158015610cf757600080fd5b505af1925050508015610d08575060015b610d1c57610d17828b8a611477565b610d20565b5060015b886001600160a01b03168a6001600160a01b03167f11ff8525c5d96036231ee652c108808dee4c40728a6117830a75029298bb7de6838b87604051808415151515815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610da5578181015183820152602001610d8d565b50505050905090810190601f168015610dd25780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a350610df2565b610df2818989611477565b806001600160a01b0316886001600160a01b03168a6001600160a01b03167f179a84706122b1b806f7d61c28c5caef276b7ff474ae596df3cad4bbaf0eb97d8d8b8b8b60405180856001600160a01b03166001600160a01b03168152602001848152602001806020018281038252848482818152602001925080828437600083820152604051601f909101601f191690920182900397509095505050505050a46040518060200160405280600081525093505050505b9695505050505050565b610ebc82826115cc565b5050565b6060610ea886868660008088886110ea565b6003602052600090815260409020546001600160a01b031681565b6001546001600160a01b031615610f3a576040805162461bcd60e51b815260206004820152600c60248201526b1053149150511657d253925560a21b604482015290519081900360640190fd5b600180546001600160a01b031916735288c571fd7ad117bea99bf60fe0846c4e84f933179055565b6060632e567b3660e01b86868686600254876040516020018083815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610fba578181015183820152602001610fa2565b50505050905090810190601f168015610fe75780820380516001836020036101000a031916815260200191505b5060408051601f19818403018152908290526001600160a01b03808b16602484019081528a8216604485015290891660648401526084830188905260a060a48401908152825160c48501528251929750909550935060e49091019150602085019080838360005b8381101561106657818101518382015260200161104e565b50505050905090810190601f1680156110935780820380516001836020036101000a031916815260200191505b5060408051601f198184030181529190526020810180516001600160e01b03166001600160e01b0319909a16999099179098525095965050505050505095945050505050565b60006110e482611508565b92915050565b6060341561112a576040805162461bcd60e51b81526020600482015260086024820152674e4f5f56414c554560c01b604482015290519081900360640190fd5b6000606061116d85858080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506115d692505050565b9150915060008061117d8c611508565b9050611191816001600160a01b0316611471565b6111d7576040805162461bcd60e51b81526020600482015260126024820152711513d2d15397d393d517d111541313d6515160721b604482015290519081900360640190fd5b6111e281858c6116c9565b6111ef8c858d8d876115b2565b915050600260008154809291906001019190505550808a6001600160a01b0316846001600160a01b03167f9c003a9d1163eca79021710dcd5d9f657218bf2bd67aaa13389009a6047894a88e8d8760405180846001600160a01b03166001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611298578181015183820152602001611280565b50505050905090810190601f1680156112c55780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a46040805160208082019390935281518082039093018352810190529a9950505050505050505050565b611306336114f4565b611352576040805162461bcd60e51b81526020600482015260186024820152774f4e4c595f434f554e544552504152545f4741544557415960401b604482015290519081900360640190fd5b60005b8381101561145b5782828281811061136957fe5b905060200201356001600160a01b03166003600087878581811061138957fe5b905060200201356001600160a01b03166001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b031602179055508282828181106113e957fe5b905060200201356001600160a01b03166001600160a01b031685858381811061140e57fe5b905060200201356001600160a01b03166001600160a01b03167f0dd664a155dd89526bb019e22b00291bb7ca9d07ba3ec4a1a76b410da9797ceb60405160405180910390a3600101611355565b5050505050565b6001546001600160a01b031681565b3b151590565b826001600160a01b0316638c2a993e83836040518363ffffffff1660e01b815260040180836001600160a01b03166001600160a01b0316815260200182815260200192505050600060405180830381600087803b1580156114d757600080fd5b505af11580156114eb573d6000803e3d6000fd5b50505050505050565b6000546001600160a01b0390811691161490565b6001600160a01b039081166000908152600360205260409020541690565b600061154487308786604051806020016040528060008152506115b2565b506001979650505050505050565b600081601401835110156115a2576040805162461bcd60e51b815260206004820152601260248201527152656164206f7574206f6620626f756e647360701b604482015290519081900360640190fd5b500160200151600160601b900490565b6000610ea88560006115c78989898989610f62565b611729565b610ebc828261174c565b600060606115e333611756565b156116be578280602001905160408110156115fd57600080fd5b815160208301805160405192949293830192919084600160201b82111561162357600080fd5b90830190602082018581111561163857600080fd5b8251600160201b81118282018810171561165157600080fd5b82525081516020918201929091019080838360005b8381101561167e578181015183820152602001611666565b50505050905090810190601f1680156116ab5780820380516001836020036101000a031916815260200191505b50604052509294509092506116c4915050565b50339050815b915091565b826001600160a01b03166374f4f54783836040518363ffffffff1660e01b815260040180836001600160a01b03166001600160a01b0316815260200182815260200192505050600060405180830381600087803b1580156114d757600080fd5b6000805461174490849086906001600160a01b03168561176a565b949350505050565b610ebc8282611903565b6001546001600160a01b0390811691161490565b604080516349460b4d60e11b81526001600160a01b0384166004820190815260248201928352835160448301528351600093849360649363928c169a938b938a938a93929088019060208501908083838d5b838110156117d45781810151838201526020016117bc565b50505050905090810190601f1680156118015780820380516001836020036101000a031916815260200191505b5093505050506020604051808303818588803b15801561182057600080fd5b505af1158015611834573d6000803e3d6000fd5b50505050506040513d602081101561184b57600080fd5b5051604080516020808252865182820152865193945084936001600160a01b03808a1694908b16937f2b986d32a0536b7e19baa48ab949fec7b903b7fad7730820b20632d100cc3a68938a93919283929083019185019080838360005b838110156118c05781810151838201526020016118a8565b50505050905090810190601f1680156118ed5780820380516001836020036101000a031916815260200191505b509250505060405180910390a495945050505050565b6001600160a01b038216611954576040805162461bcd60e51b81526020600482015260136024820152721253959053125117d0d3d55395115494105495606a1b604482015290519081900360640190fd5b6000546001600160a01b0316156119a1576040805162461bcd60e51b815260206004820152600c60248201526b1053149150511657d253925560a21b604482015290519081900360640190fd5b600080546001600160a01b039384166001600160a01b0319918216179091556001805492909316911617905556fe4d696e7420616e642063616c6c20676173206c6566742063616c63756c6174696f6e20756e6465666c6f77a264697066735822122047f5a7bbc79e671b5208f37bd9df4e9b4378d81bf5bcc932cbb6cc75433fd57c64736f6c634300060b0033'
