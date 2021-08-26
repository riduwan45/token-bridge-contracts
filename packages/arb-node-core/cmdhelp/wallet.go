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

package cmdhelp

import (
	"fmt"
	"math"
	"math/big"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/accounts/keystore"
	"golang.org/x/crypto/ssh/terminal"

	"github.com/offchainlabs/arbitrum/packages/arb-util/configuration"
)

func readPass() (string, error) {
	bytePassword, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil {
		return "", err
	}
	passphrase := string(bytePassword)
	passphrase = strings.TrimSpace(passphrase)
	return passphrase, nil
}

// GetKeystore returns a transaction authorization based on an existing ethereum
// keystore located in validatorFolder/wallets or creates one if it does not
// exist. It accepts a password using the "password" command line argument or
// via an interactive prompt. It also sets the gas price of the auth via an
// optional "gasprice" arguement.
func GetKeystore(
	validatorFolder string,
	wallet *configuration.Wallet,
	gasPrice float64,
	chainId *big.Int,
) (*bind.TransactOpts, func([]byte) ([]byte, error), error) {
	ks := keystore.NewKeyStore(
		filepath.Join(validatorFolder, "wallets"),
		keystore.StandardScryptN,
		keystore.StandardScryptP,
	)

	creatingNew := len(ks.Accounts()) == 0
	passOpt := wallet.Password()
	var password string
	if passOpt != nil {
		password = *passOpt
	} else {
		if creatingNew {
			fmt.Print("Enter new account password: ")
		} else {
			fmt.Print("Enter account password: ")
		}
		var err error
		password, err = readPass()
		if err != nil {
			return nil, nil, err
		}
	}

	var account accounts.Account
	if creatingNew {
		var err error
		account, err = ks.NewAccount(password)
		if err != nil {
			return nil, nil, err
		}
	} else {
		account = ks.Accounts()[0]
	}

	err := ks.Unlock(account, password)
	if err != nil {
		return nil, nil, err
	}

	auth, err := bind.NewKeyStoreTransactorWithChainID(ks, account, chainId)
	if err != nil {
		return nil, nil, err
	}

	gasPriceAsFloat := 1e9 * gasPrice
	if gasPriceAsFloat < math.MaxInt64 && gasPriceAsFloat > 0 {
		auth.GasPrice = big.NewInt(int64(gasPriceAsFloat))
	}

	signer := func(data []byte) ([]byte, error) {
		return ks.SignHash(account, data)
	}

	return auth, signer, nil
}

const WalletArgsString = "[--wallet.password=pass] [--wallet.gasprice==FloatInGwei]"
