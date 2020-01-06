/*
* Copyright 2020, Offchain Labs, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

package rollup

import (
	"context"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/offchainlabs/arbitrum/packages/arb-util/utils"
	"github.com/offchainlabs/arbitrum/packages/arb-validator/challenges"
	"github.com/offchainlabs/arbitrum/packages/arb-validator/structures"

	"github.com/offchainlabs/arbitrum/packages/arb-validator/ethbridge"
)

type ChainListener interface {
	StakeCreated(ethbridge.StakeCreatedEvent)
	StakeRemoved(ethbridge.StakeRefundedEvent)
	StakeMoved(ethbridge.StakeMovedEvent)
	StartedChallenge(ethbridge.ChallengeStartedEvent, *Node, *Node)
	CompletedChallenge(event ethbridge.ChallengeCompletedEvent)
}

type ValidatorChainListener struct {
	chain  *ChainObserver
	vm     *ethbridge.ArbRollup
	myAddr common.Address
	client *ethclient.Client
	auth   *bind.TransactOpts
	ch     chan interface{}
}

func NewValidatorChainListener(
	chain *ChainObserver,
	vm *ethbridge.ArbRollup,
	myAddr common.Address,
	client *ethclient.Client,
	auth *bind.TransactOpts,
	runLoop func(*ValidatorChainListener),
) {
	ret := &ValidatorChainListener{chain, vm, myAddr, client, auth, make(chan interface{}, 1024)}
	go runLoop(ret)
}

func (lis *ValidatorChainListener) StakeCreated(ev ethbridge.StakeCreatedEvent) {
	if utils.AddressesEqual(ev.Staker, lis.myAddr) {
		opps := lis.chain.nodeGraph.checkChallengeOpportunityAllPairs()
		for _, opp := range opps {
			lis.initiateChallenge(opp)
		}
	} else {
		lis.challengeStakerIfPossible(ev.Staker)
	}
}

func (lis *ValidatorChainListener) StakeRemoved(ethbridge.StakeRefundedEvent) {

}

func (lis *ValidatorChainListener) StakeMoved(ev ethbridge.StakeMovedEvent) {
	lis.challengeStakerIfPossible(ev.Staker)
}

func (lis *ValidatorChainListener) challengeStakerIfPossible(stakerAddr common.Address) {
	if !utils.AddressesEqual(stakerAddr, lis.myAddr) {
		newStaker := lis.chain.nodeGraph.stakers.Get(stakerAddr)
		meAsStaker := lis.chain.nodeGraph.stakers.Get(lis.myAddr)
		if meAsStaker != nil {
			opp := lis.chain.nodeGraph.checkChallengeOpportunityPair(newStaker, meAsStaker)
			if opp != nil {
				lis.initiateChallenge(opp)
				return
			}
		}
		opp := lis.chain.nodeGraph.checkChallengeOpportunityAny(newStaker)
		if opp != nil {
			lis.initiateChallenge(opp)
			return
		}
	}
}

func (lis *ValidatorChainListener) initiateChallenge(opp *challengeOpportunity) {
	go func() { // we're holding a lock on the chain, so launch the challenge asynchronously
		lis.vm.StartChallenge(
			context.TODO(),
			opp.asserter,
			opp.challenger,
			opp.prevNodeHash,
			opp.deadlineTicks.Val,
			opp.asserterNodeType,
			opp.challengerNodeType,
			opp.asserterProtoHash,
			opp.challengerProtoHash,
			opp.asserterProof,
			opp.challengerProof,
			opp.asserterDataHash,
			opp.asserterPeriodTicks,
			opp.challengerNodeHash,
		)
	}()
}

func (lis *ValidatorChainListener) StartedChallenge(ev ethbridge.ChallengeStartedEvent, asserterAncestor *Node, challengerAncestor *Node) {
	if utils.AddressesEqual(lis.myAddr, ev.Asserter) {
		lis.actAsAsserter(ev, asserterAncestor)
	}
	if utils.AddressesEqual(lis.myAddr, ev.Challenger) {
		lis.actAsChallenger(ev, asserterAncestor)
	}
}

func (lis *ValidatorChainListener) actAsChallenger(ev ethbridge.ChallengeStartedEvent, conflictNode *Node) {
	switch conflictNode.linkType {
	case structures.InvalidPendingChildType:
		go challenges.ChallengePendingTopClaim(
			nil,
			nil,
			ev.ChallengeContract,
			lis.chain.pendingInbox,
		)
	case structures.InvalidMessagesChildType:
		go challenges.ChallengeMessagesClaim(
			nil,
			nil,
			ev.ChallengeContract,
			lis.chain.pendingInbox,
			conflictNode.vmProtoData.PendingTop,
			conflictNode.disputable.AssertionClaim.AfterPendingTop,
		)
	case structures.InvalidExecutionChildType:
		go challenges.ChallengeExecutionClaim(
			nil,
			nil,
			ev.ChallengeContract,
			conflictNode.ExecutionPrecondition(),
			conflictNode.machine,
		)
	}
}

func (lis *ValidatorChainListener) actAsAsserter(ev ethbridge.ChallengeStartedEvent, conflictNode *Node) {
	switch conflictNode.linkType {
	case structures.InvalidPendingChildType:
		go challenges.DefendPendingTopClaim(
			nil,
			nil,
			ev.ChallengeContract,
			lis.chain.pendingInbox,
			conflictNode.disputable.AssertionClaim.AfterPendingTop,
			conflictNode.disputable.MaxPendingTop,
		)
	case structures.InvalidMessagesChildType:
		go challenges.DefendMessagesClaim(
			nil,
			nil,
			ev.ChallengeContract,
			lis.chain.pendingInbox,
			conflictNode.vmProtoData.PendingTop,
			conflictNode.disputable.AssertionClaim.AfterPendingTop,
			conflictNode.disputable.AssertionClaim.ImportedMessagesSlice,
		)
	case structures.InvalidExecutionChildType:
		go challenges.DefendExecutionClaim(
			nil,
			nil,
			ev.ChallengeContract,
			conflictNode.ExecutionPrecondition(),
			conflictNode.disputable.AssertionParams.NumSteps,
			conflictNode.disputable.AssertionClaim.AssertionStub,
			conflictNode.machine,
		)
	}
}

func (lis *ValidatorChainListener) CompletedChallenge(ev ethbridge.ChallengeCompletedEvent) {
	if utils.AddressesEqual(lis.myAddr, ev.Winner) {
		lis.wonChallenge(ev)
	}
	if utils.AddressesEqual(lis.myAddr, ev.Loser) {
		lis.lostChallenge(ev)
	}
	lis.challengeStakerIfPossible(ev.Winner)
}

func (lis *ValidatorChainListener) lostChallenge(ethbridge.ChallengeCompletedEvent) {

}

func (lis *ValidatorChainListener) wonChallenge(ethbridge.ChallengeCompletedEvent) {

}
