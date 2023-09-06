package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Define key names for options
const nameKey = "name"
const symbolKey = "symbol"
const decimalsKey = "decimals"
const totalSupplyKey = "totalSupply"

// Define objectType names for prefix
const allowancePrefix = "allowance"
const usedPrefix = "used"

// Define key names for options

// SmartContract provides functions for transferring tokens between accounts
type SmartContract struct {
	contractapi.Contract
}

// event provides an organized struct for emitting events
type event struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Value uint64 `json:"value"`
}

// Mint creates new tokens and adds them to minter's account balance
// This function triggers a Transfer event
func (s *SmartContract) Mint(ctx contractapi.TransactionContextInterface, amount uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}
	minterbytes := sha256.Sum256([]byte(minter))
	minter = "0x" + hex.EncodeToString(minterbytes[:20])
	
	err = addBalance(ctx, minter, amount)
	if err != nil {
		return fmt.Errorf("failed to mint: %v", err)
	}

	// Update the totalSupply
	err = addBalance(ctx, totalSupplyKey, amount)
	if err != nil {
		return fmt.Errorf("failed to increase the total supply: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{"0x0000000000000000000000000000000000000000", minter, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Mint", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

// Burn redeems tokens the minter's account balance
// This function triggers a Transfer event
func (s *SmartContract) Burn(ctx contractapi.TransactionContextInterface, amount uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	if amount <= 0 {
		return errors.New("burn amount must be a positive integer")
	}
	minterbytes := sha256.Sum256([]byte(minter))
	minter = "0x" + hex.EncodeToString(minterbytes[:20])
	err = removeBalance(ctx, minter, amount)
	if err != nil {
		return fmt.Errorf("failed to burn: %v", err)
	}

	// Update the totalSupply
	err = removeBalance(ctx, totalSupplyKey, amount)
	if err != nil {
		return fmt.Errorf("failed to burn: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{minter, "0x0000000000000000000000000000000000000000", amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Burn", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

// Transfer transfers tokens from client account to recipient account
// recipient account must be a valid clientID as returned by the ClientID() function
// This function triggers a Transfer event
func (s *SmartContract) Transfer(ctx contractapi.TransactionContextInterface, recipient string, amount uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(clientID))
	clientID = "0x" + hex.EncodeToString(clientIDBytes[:20])
	err = transferHelper(ctx, clientID, recipient, amount)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{clientID, recipient, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

func (s *SmartContract) Use(ctx contractapi.TransactionContextInterface, recipient string, amount uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(clientID))
	clientID = "0x" + hex.EncodeToString(clientIDBytes[:20])
	err = useHelper(ctx, clientID, recipient, amount)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{clientID, recipient, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Use", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

// BalanceOf returns the balance of the given account
func (s *SmartContract) BalanceOf(ctx contractapi.TransactionContextInterface, account string) (uint64, error) {
	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(account, []string{})
	if err != nil {
		return 0, fmt.Errorf("failed to get state for client %v: %v", account, err)
	}
	defer balanceIterator.Close()

	var balance uint64 = 0

	for balanceIterator.HasNext() {
		queryResponse, err := balanceIterator.Next()
		if err != nil {
			return 0, fmt.Errorf("failed to get the next state for client %v: %v", account, err)
		}

		partBalAmount, _ := strconv.ParseUint(string(queryResponse.Value), 10, 64)
		balance, err = add(balance, partBalAmount)
		if err != nil {
			return 0, err
		}
	}
	return balance, nil
}

func (s *SmartContract) UsedBalanceOf(ctx contractapi.TransactionContextInterface, account string) (uint64, error) {
	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(usedPrefix, []string{account})
	if err != nil {
		return 0, fmt.Errorf("failed to get state for client %v: %v", account, err)
	}
	defer balanceIterator.Close()

	var balance uint64 = 0

	for balanceIterator.HasNext() {
		queryResponse, err := balanceIterator.Next()
		if err != nil {
			return 0, fmt.Errorf("failed to get the next state for client %v: %v", account, err)
		}

		partBalAmount, _ := strconv.ParseUint(string(queryResponse.Value), 10, 64)
		balance, err = add(balance, partBalAmount)
		if err != nil {
			return 0, err
		}
	}

	return balance, nil
}

// ClientAccountBalance returns the balance of the requesting client's account
func (s *SmartContract) ClientAccountBalance(ctx contractapi.TransactionContextInterface) (uint64, error) {
	// Get ID of submitting client identity
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(clientID))
	clientID = "0x" + hex.EncodeToString(clientIDBytes[:20])
	return s.BalanceOf(ctx, clientID)
}

func (s *SmartContract) ClientAccountUsedBalance(ctx contractapi.TransactionContextInterface) (uint64, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(clientID))
	clientAccountID := "0x" + hex.EncodeToString(clientIDBytes[:20])

	return s.UsedBalanceOf(ctx, clientAccountID)
}

// ClientAccountID returns the id of the requesting client's account
// In this implementation, the client account ID is the clientId itself
// Users can use this function to get their own account id, which they can then give to others as the payment address
func (s *SmartContract) ClientAccountID(ctx contractapi.TransactionContextInterface) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	clientAccountID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(clientAccountID))
	clientAccountID = "0x" + hex.EncodeToString(clientIDBytes[:20])
	txID := "0000000000000000000000000000000000000000000000000000000000000000"

	balanceKey, err := ctx.GetStub().CreateCompositeKey(clientAccountID, []string{txID})
	if err != nil {
		return "", fmt.Errorf("failed to create the composite key for client %s: %v", clientAccountID, err)
	}
	balanceBytes, err := ctx.GetStub().GetState(balanceKey)
	if err != nil {
		return "", fmt.Errorf("failed to read client account %s from world state: %v", clientAccountID, err)
	}
	if balanceBytes == nil {
		/* register */
		value := uint64(0)
		err = ctx.GetStub().PutState(balanceKey, []byte(strconv.FormatUint(value, 10)))
		if err != nil {
			return "", err
		}
	}
	return clientAccountID, nil
}

// TotalSupply returns the total token supply
func (s *SmartContract) TotalSupply(ctx contractapi.TransactionContextInterface) (uint64, error) {
	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Retrieve total supply of tokens from state of smart contract
	totalSupply, err := s.BalanceOf(ctx, totalSupplyKey)

	log.Printf("TotalSupply: %d tokens", totalSupply)

	return totalSupply, nil
}

// Approve allows the spender to withdraw from the calling client's token account
// The spender can withdraw multiple times if necessary, up to the value amount
// This function triggers an Approval event
func (s *SmartContract) Approve(ctx contractapi.TransactionContextInterface, spender string, value uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	owner, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(owner))
	owner = "0x" + hex.EncodeToString(clientIDBytes[:20])
	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	txID := "0000000000000000000000000000000000000000000000000000000000000000"
	toCurrentBalanceKey, err := ctx.GetStub().CreateCompositeKey(spender, []string{txID}) 
	toCurrentBalanceBytes, err := ctx.GetStub().GetState(toCurrentBalanceKey)
	if err != nil {
		return fmt.Errorf("failed to read spender account %s from world state: %v", spender, err)
	}
	if toCurrentBalanceBytes == nil {
		return fmt.Errorf("failed to read spender account %s from world state: %v", spender, err)
	}

	// Update the state of the smart contract by adding the allowanceKey and value
	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.FormatUint(value, 10)))
	if err != nil {
		return fmt.Errorf("failed to update state of smart contract for key %s: %v", allowanceKey, err)
	}

	// Emit the Approval event
	approvalEvent := event{owner, spender, value}
	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval", approvalEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("client %s approved a withdrawal allowance of %d for spender %s", owner, value, spender)

	return nil
}

// Allowance returns the amount still available for the spender to withdraw from the owner
func (s *SmartContract) Allowance(ctx contractapi.TransactionContextInterface, owner string, spender string) (uint64, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	txID := "0000000000000000000000000000000000000000000000000000000000000000"
	toCurrentBalanceKey, err := ctx.GetStub().CreateCompositeKey(spender, []string{txID}) 
	toCurrentBalanceBytes, err := ctx.GetStub().GetState(toCurrentBalanceKey)
	if err != nil {
		return 0, fmt.Errorf("failed to read spender account %s from world state: %v", spender, err)
	}
	if toCurrentBalanceBytes == nil {
		return 0, fmt.Errorf("failed to read spender account %s from world state: %v", spender, err)
	}

	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return 0, fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Read the allowance amount from the world state
	allowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return 0, fmt.Errorf("failed to read allowance for %s from world state: %v", allowanceKey, err)
	}

	var allowance uint64

	// If no current allowance, set allowance to 0
	if allowanceBytes == nil {
		allowance = 0
	} else {
		allowance, err = strconv.ParseUint(string(allowanceBytes), 10, 64)
	}

	log.Printf("The allowance left for spender %s to withdraw from owner %s: %d", spender, owner, allowance)

	return allowance, nil
}

// TransferFrom transfers the value amount from the "from" address to the "to" address
// This function triggers a Transfer event
func (s *SmartContract) TransferFrom(ctx contractapi.TransactionContextInterface, from string, to string, value uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	spender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(spender))
	spender = "0x" + hex.EncodeToString(clientIDBytes[:20])
	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{from, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Retrieve the allowance of the spender
	currentAllowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve the allowance for %s from world state: %v", allowanceKey, err)
	}

	currentAllowance, _ := strconv.ParseUint(string(currentAllowanceBytes), 10, 64)

	// Check if transferred value is less than allowance
	if currentAllowance < value {
		return fmt.Errorf("spender does not have enough allowance for transfer")
	}

	// Initiate the transfer
	err = transferHelper(ctx, from, to, value)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	// Decrease the allowance
	updatedAllowance, err := sub(currentAllowance, value)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.FormatUint(updatedAllowance, 10)))
	if err != nil {
		return err
	}

	// Emit the Transfer event
	transferEvent := event{from, to, value}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("spender %s allowance updated from %d to %d", spender, currentAllowance, updatedAllowance)

	return nil
}

func (s *SmartContract) UseFrom(ctx contractapi.TransactionContextInterface, from string, to string, value uint64) error {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	spender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	clientIDBytes := sha256.Sum256([]byte(spender))
	spender = "0x" + hex.EncodeToString(clientIDBytes[:20])
	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{from, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Retrieve the allowance of the spender
	currentAllowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve the allowance for %s from world state: %v", allowanceKey, err)
	}

	currentAllowance, _ := strconv.ParseUint(string(currentAllowanceBytes), 10, 64)

	// Check if transferred value is less than allowance
	if currentAllowance < value {
		return fmt.Errorf("spender does not have enough allowance for transfer")
	}

	// Initiate the transfer
	err = useHelper(ctx, from, to, value)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	// Decrease the allowance
	updatedAllowance, err := sub(currentAllowance, value)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.FormatUint(updatedAllowance, 10)))
	if err != nil {
		return err
	}

	// Emit the Transfer event
	transferEvent := event{from, to, value}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Use", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("spender %s allowance updated from %d to %d", spender, currentAllowance, updatedAllowance)

	return nil
}

// Name returns a descriptive name for fungible tokens in this contract
// returns {String} Returns the name of the token
func (s *SmartContract) Name(ctx contractapi.TransactionContextInterface) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := ctx.GetStub().GetState(nameKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Name bytes: %s", err)
	}

	return string(bytes), nil
}

// Symbol returns an abbreviated name for fungible tokens in this contract.
// returns {String} Returns the symbol of the token
func (s *SmartContract) Symbol(ctx contractapi.TransactionContextInterface) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := ctx.GetStub().GetState(symbolKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Symbol: %v", err)
	}

	return string(bytes), nil
}

func (s *SmartContract) Decimals(ctx contractapi.TransactionContextInterface) (string, error) {

        // Check if contract has been intilized first
        initialized, err := checkInitialized(ctx)
        if err != nil {
                return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
        }
        if !initialized {
                return "", fmt.Errorf("Contract options need to be set before calling any function, call Initialize() to initialize contract")
        }

        bytes, err := ctx.GetStub().GetState(decimalsKey)
        if err != nil {
                return "", fmt.Errorf("failed to get Decimals: %v", err)
        }

        return string(bytes), nil
}

// Set information for a token and intialize contract.
// param {String} name The name of the token
// param {String} symbol The symbol of the token
// param {String} decimals The decimals used for the token operations
func (s *SmartContract) Initialize(ctx contractapi.TransactionContextInterface, name string, symbol string, decimals string) (bool, error) {
	// Check contract options are not already set, client is not authorized to change them once intitialized
	bytes, err := ctx.GetStub().GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get Name: %v", err)
	}
	if bytes != nil {
		return false, fmt.Errorf("contract options are already set, client is not authorized to change them")
	}

	err = ctx.GetStub().PutState(nameKey, []byte(name))
	if err != nil {
		return false, fmt.Errorf("failed to set token name: %v", err)
	}

	err = ctx.GetStub().PutState(symbolKey, []byte(symbol))
	if err != nil {
		return false, fmt.Errorf("failed to set symbol: %v", err)
	}

	err = ctx.GetStub().PutState(decimalsKey, []byte(decimals))
	if err != nil {
		return false, fmt.Errorf("failed to set token name: %v", err)
	}

	return true, nil
}

// Helper Functions
func addBalance(ctx contractapi.TransactionContextInterface, recipient string, amount uint64) error {
	txID := ctx.GetStub().GetTxID()

	balanceKey, err := ctx.GetStub().CreateCompositeKey(recipient, []string{txID})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", recipient, err)
	}

	err = ctx.GetStub().PutState(balanceKey, []byte(strconv.FormatUint(amount, 10)))
	if err != nil {
		return err
	}
	log.Printf("client %s carbon token balance increased to %d", recipient, amount)
	return nil
}

func removeBalance(ctx contractapi.TransactionContextInterface, sender string, amount uint64) error {
	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(sender, []string{})
	if err != nil {
		return fmt.Errorf("failed to get state for prefix %v: %v", sender, err)
	}
	defer balanceIterator.Close()

	var balance uint64 = 0

	for balanceIterator.HasNext() {
		queryResponse, err := balanceIterator.Next()
		if err != nil {
			return fmt.Errorf("failed to get the next state for client %v: %v", sender, err)
		}

		partBalAmount, _ := strconv.ParseUint(string(queryResponse.Value), 10, 64)
		balance, err = add(balance, partBalAmount)
		if err != nil {
			return err
		}

		err = ctx.GetStub().DelState(queryResponse.Key)
		if err != nil {
			return fmt.Errorf("failed to delete the state of %v: %v", queryResponse.Key, err)
		}
	}

	if balance < amount {
		return fmt.Errorf("sender has insufficient funds, needed funds: %v, available fund: %v", amount, balance)
	} else {
		// Send the remainder back to the sender
		remainder, err := sub(balance, amount)
		if err != nil {
			return err
		}

		balanceKey, err := ctx.GetStub().CreateCompositeKey(sender, []string{"0000000000000000000000000000000000000000000000000000000000000000"})
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState(balanceKey, []byte(strconv.FormatUint(remainder, 10)))
		if err != nil {
			return err
		}
		log.Printf("client %s carbon token balance updated from %d to %d", sender, balance, remainder)
		return nil
	}
	return nil
}

// transferHelper is a helper function that transfers tokens from the "from" address to the "to" address
// Dependant functions include Transfer and TransferFrom
func transferHelper(ctx contractapi.TransactionContextInterface, from string, to string, value uint64) error {
	if from == to {
		return fmt.Errorf("cannot transfer to and from same client account")
	}
	txID := "0000000000000000000000000000000000000000000000000000000000000000"
	toCurrentBalanceKey, err := ctx.GetStub().CreateCompositeKey(to, []string{txID}) 
	toCurrentBalanceBytes, err := ctx.GetStub().GetState(toCurrentBalanceKey)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}
	if toCurrentBalanceBytes == nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	err = removeBalance(ctx, from, value)
	if err != nil {
		return fmt.Errorf("failed to transfer from spender account %s: %v", to, err)
	}

	err = addBalance(ctx, to, value)
	if err != nil {
		return fmt.Errorf("failed to transfer to recipient account %s: %v", to, err)
	}

	return nil
}

func useHelper(ctx contractapi.TransactionContextInterface, from string, to string, value uint64) error {

	if from == to {
		return fmt.Errorf("cannot use to and from same client account")
	}
	txID := "0000000000000000000000000000000000000000000000000000000000000000"
	toCurrentBalanceKey, err := ctx.GetStub().CreateCompositeKey(to, []string{txID}) 
	toCurrentBalanceBytes, err := ctx.GetStub().GetState(toCurrentBalanceKey)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}
	if toCurrentBalanceBytes == nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	err = removeBalance(ctx, from, value)
	if err != nil {
		return fmt.Errorf("failed to use from spender account %s: %v", from, err)
	}

	txID = ctx.GetStub().GetTxID()

	balanceKey, err := ctx.GetStub().CreateCompositeKey(usedPrefix, []string{to, txID})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for client %s: %v", to, err)
	}

	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(usedPrefix, []string{to})
	if err != nil {
		return fmt.Errorf("failed to get state for client %v: %v", to, err)
	}
	defer balanceIterator.Close()

	for balanceIterator.HasNext() {
		queryResponse, err := balanceIterator.Next()
		if err != nil {
			return fmt.Errorf("failed to get the next state for client %v: %v", to, err)
		}

		partBalAmount, _ := strconv.ParseUint(string(queryResponse.Value), 10, 64)
		value, err = add(value, partBalAmount)
		if err != nil {
			return err
		}

		err = ctx.GetStub().DelState(queryResponse.Key)
		if err != nil {
			return fmt.Errorf("failed to delete the state of %v: %v", queryResponse.Key, err)
		}
	}

	err = ctx.GetStub().PutState(balanceKey, []byte(strconv.FormatUint(value, 10)))
	if err != nil {
		return err
	}
	log.Printf("client %s emission token balance increased to %d", to, value)

	return nil
}

// add two number checking for overflow
func add(b uint64, q uint64) (uint64, error) {

	// Check overflow
	var sum uint64
	sum = q + b

	if sum < q {
		return 0, fmt.Errorf("Math: addition overflow occurred %d + %d", b, q)
	}

	return sum, nil
}

// Checks that contract options have been already initialized
func checkInitialized(ctx contractapi.TransactionContextInterface) (bool, error) {
	tokenName, err := ctx.GetStub().GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get token name: %v", err)
	}

	if tokenName == nil {
		return false, nil
	}

	return true, nil
}

// sub two number checking for overflow
func sub(b uint64, q uint64) (uint64, error) {

	// Check overflow
	var diff uint64
	diff = b - q

	if diff > b {
		return 0, fmt.Errorf("Math: subtraction overflow occurred  %d - %d", b, q)
	}

	return diff, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(&SmartContract{})
    if err != nil {
        log.Panicf("Error creating chaincode: %v", err)
    }
    if err := chaincode.Start(); err != nil {
        log.Panicf("Error starting chaincode: %v", err)
    }
}
