import React, {useState, useEffect, useContext} from 'react'
import AuthContext from '../context/AuthContext'
import './TransferPage.css'

const TransferPage = () => {
    
    let {authTokens, logoutTokens} = useContext(AuthContext)
    let {user, logoutUser} = useContext(AuthContext)

    const [balance, setBalance] = useState(null)

    const [clientID, setClientID] = useState(null)
    const [showClientID, setShowClientID] = useState(false)

    const [totalSupply, setTotalSupply] = useState(null)
    const [showSupply, setShowSupply] = useState(false)

    const [balanceOf, setBalanceOf] = useState(null)
    const [balanceOfAccount, setBalanceOfAccount] = useState(null)
    const [showBalanceOf, setShowBalanceOf] = useState(false)

    const [transferRecipient, setTransferRecipient] = useState(null)
    const [transferAmount, setTransferAmount] = useState(null)
    const [showTransfer, setShowTransfer] = useState(false)
    const [transferStatus, setTransferStatus] = useState(null)

    const [approveSpender, setApproveSpender] = useState(null)
    const [approveValue, setApproveValue] = useState(null)
    const [approveStatus, setApproveStatus ] = useState(null)
    const [showApprove, setShowApprove] = useState(false)

    const [allowanceOwner, setAllowanceOwner] = useState(null)
    const [allowanceSpender, setAllowanceSpender] = useState(null)
    const [allowanceStatus, setAllowanceStatus] = useState(null)
    const [showAllowance, setShowAllowance] = useState(false)

    const [tfFrom, setTfFrom] = useState(null)
    const [tfTo, setTfTo] = useState(null)
    const [tfValue, setTfValue] = useState(null)
    const [tfStatus, setTfStatus] = useState(null)
    const [showTf, setShowTf] = useState(false)

    const [usedBalanceOf, setUsedBalanceOf] = useState(null)
    const [usedBalanceOfAccount, setUsedBalanceOfAccount] = useState(null)
    const [showUsedBalanceOf, setShowUsedBalanceOf] = useState(false)

    const [useRecipient, setUseRecipient] = useState(null)
    const [useAmount, setUseAmount] = useState(null)
    const [showUse, setShowUse] = useState(false)
    const [useStatus, setUseStatus] = useState(null)

    const [useFrom, setUseFrom] = useState(null)
    const [useTo, setUseTo] = useState(null)
    const [useValue, setUseValue] = useState(null)
    const [useFromStatus, setUseFromStatus] = useState(null)
    const [showUseFrom, setShowUseFrom] = useState(false)

    const [mint, setMint] = useState(null)
    const [mintStatus, setMintStatus] = useState(null)
    const [showMint, setShowMint] = useState(false)

    const [burn, setBurn] = useState(null)
    const [burnStatus, setBurnStatus] = useState(null)
    const [showBurn, setShowBurn] = useState(false)

    const fetchBalance = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=clientAccountBalance`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setBalance(data.result)
            // console.log("balance: ", balance[2])
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchClientID = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=clientAccountID`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setClientID(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchTotalSupply = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=totalSupply`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setTotalSupply(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchBalanceOf = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=balanceOf%20${balanceOfAccount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            if(data.result=='Failed.') {
                setBalanceOf('Failed, please try again.')
            }else{
                setBalanceOf(data.result)
            }
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchTransfer = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=transfer%20${transferRecipient}%20${transferAmount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setTransferStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchApprove = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=approve%20${approveSpender}%20${approveValue}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setApproveStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchAllowance = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=allowance%20${allowanceOwner}%20${allowanceSpender}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setAllowanceStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchTransferFrom = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=transferFrom%20${tfFrom}%20${tfTo}%20${tfValue}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setTfStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchUsedBalanceOf = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=usedBalanceOf%20${usedBalanceOfAccount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            if(data.result=='Failed.') {
                setUsedBalanceOf('Failed, please try again.')
            }else{
                setUsedBalanceOf(data.result)
            }
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchUse = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=use%20${useRecipient}%20${useAmount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setUseStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchUseFrom = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=useFrom%20${useFrom}%20${useTo}%20${useValue}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setUseFromStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchMint  = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=mint%20${mint}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setMintStatus(data.result)
            console.log(data);
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchBurn  = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=burn%20${burn}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setBurnStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const balanceOfAccountHandler = (e) => {
        setBalanceOfAccount(e.target.value);
    }

    const balanceOfHandler = (e) => {
        fetchBalanceOf(balanceOf);
    }



    useEffect(() => {
        
        fetchBalance(); // on first render, refresh
        fetchClientID();
        fetchTotalSupply();

        const interval = setInterval(() => {
            fetchBalance();
        }, 1000000); /* 10000 ten sec*/
        return () => clearInterval(interval);

    }, [])



    const transferRecipientHandler = (e) => {
        setTransferRecipient(e.target.value);
    }
    const transferAmountHandler = (e) => {
        setTransferAmount(e.target.value);
    }

    const transferHandler = async () => {
        try {
            fetchTransfer();
        } catch (error) {
            console.log(error);
        }
    }

    const approveSenderHandler = (e) => {
        setApproveSpender(e.target.value);
    }
    const appoveValueHandler = (e) => {
        setApproveValue(e.target.value);
    }

    const approveHandler = async () => {
        try {
            fetchApprove();
        } catch (error) {
            console.log(error);
        }
    }

    const allowanceOwnerHandler = (e) => {
        setAllowanceOwner(e.target.value);
    }
    const allowanceSpenderHandler = (e) => {
        setAllowanceSpender(e.target.value);
    }
    const allowanceHandler = async () => {
        try {
            fetchAllowance();
        } catch (error) {
            console.log(error);
        }
    }

    const tfFromHandler = (e) => {
        setTfFrom(e.target.value);
    }
    const tfToHandler = (e) => {
        setTfTo(e.target.value);
    }
    const tfValueHandler = (e) => {
        setTfValue(e.target.value);
    }
    const tfHandler = async () => {
        try {
            fetchTransferFrom();
        } catch (error) {
            console.log(error);
        }
    }

    const balanceOfUsedAccountHandler = (e) => {
        setUsedBalanceOfAccount(e.target.value);
    }   
    const balanceOfUsedHandler = (e) => {
        fetchUsedBalanceOf();
    }

    const useRecipientHAndler = (e) => {
        setUseRecipient(e.target.value);
    }
    const useAmountHandler = (e) => {
        setUseAmount(e.target.value);
    }
    const useHandler = async () => {
        try {
            fetchUse();
        } catch (error) {
            console.log(error);
        }
    }

    const useFromHandler = (e) => {
        setUseFrom(e.target.value);
    }
    const useToHandler = (e) => {
        setUseTo(e.target.value);
    }
    const useValueHandler = (e) => {
        setUseValue(e.target.value);
    }
    const useFromToHandler = async () => {
        try {
            fetchUseFrom();
        } catch (error) {
            console.log(error);
        }
    }


    const mintValueHandler = (e) => {
        setMint(e.target.value);
        console.log(mint);
    }
    const burnValueHandler = (e) => {
        setBurn(e.target.value);
    }
    const mintHandler = async () => {
        console.log('mint');
        try {
            fetchMint();
        } catch (error) {
            console.log(error);
        }
    }
    const burnHandler = async () => {
        try {
            fetchBurn();
        } catch (error) {
            console.log(error);
        }
    }
    return (
      <div className='transferContainer'>
        <div className='functionsContainer'>
            <div className='funcCat'>Search</div>
            <i class='fa fa-search' ></i>
            <div className='funcDropContainer' >
                <div className='funcItemContainer' onClick={ () => { 
                            setBalanceOfAccount(null); 
                            setBalanceOf("");
                            setShowBalanceOf(!showBalanceOf);
                        } } >
                    
                    <p>Search for the balance of an account</p>                
                </div>
                { showBalanceOf && 
                    (   
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ balanceOfAccountHandler } placeholder='Account'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ balanceOfHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ balanceOf }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcDropContainer' >
                <div className='funcItemContainer' onClick={ () => { 
                            setUsedBalanceOfAccount(null); 
                            setUsedBalanceOf("");
                            setShowUsedBalanceOf(!showUsedBalanceOf);
                        } } >
                    <p>Search for the used balance of an account</p>                
                </div>
                { showUsedBalanceOf && 
                    (   
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ balanceOfUsedAccountHandler } placeholder='Account'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ balanceOfUsedHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ usedBalanceOf }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcDropContainer'>
                <div className='funcItemContainer' 
                    onClick={ () => { 
                        setAllowanceOwner(null); 
                        setAllowanceSpender(null);
                        setShowAllowance(!showAllowance) 
                        setAllowanceStatus(null);
                    } }>
                    {/* <i class="fa-sharp fa-solid fa-coins" ></i> */}
                    <p>Search for the amount still available for the client account to withdraw from the owner account</p>
                </div>
                {
                    showAllowance && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ allowanceOwnerHandler } placeholder='Owner Address'></input>
                                <input onChange={ allowanceSpenderHandler } placeholder='Client Address'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ allowanceHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ allowanceStatus }</div>
                        </div>
                        
                    )
                }
            </div>
            <div className='funcCat'>Transfer</div>
            <i class="fa fa-send"></i>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setTransferRecipient(null); 
                        setTransferAmount(null);
                        setShowTransfer(!showTransfer) 
                        setTransferStatus(null);
                    } } >
                    <p>Send tokens to recipient account</p>
                </div>
                {
                    showTransfer && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ transferRecipientHandler } placeholder='Recipient Address'></input>
                                <input onChange={ transferAmountHandler } placeholder='Transfer Amount'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ transferHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ transferStatus }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setTfFrom(null); 
                        setTfTo(null);
                        setTfValue(null);
                        setShowTf(!showTf) 
                        setTfStatus(null);
                    } }>
                    {/* <i class="fa-solid fa-money-bill-transfer"></i> */}
                    <p>Transfer the value amount from a specific account to another</p>
                </div>
                {
                    showTf && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ tfFromHandler } placeholder='From address'></input>
                                <input onChange={ tfToHandler } placeholder='To address'></input>
                                <input onChange={ tfValueHandler } placeholder='Value'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ tfHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ tfStatus }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcCat'>Allowance</div>
            <i class="fa-solid fa-user-check"></i>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setApproveSpender(null); 
                        setApproveValue(null);
                        setShowApprove(!showApprove) 
                        setApproveStatus(null);
                    } }>
                    <p>Allow an account to withdraw from your account</p>
                </div>
                {
                    showApprove && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ approveSenderHandler } placeholder='Address'></input>
                                <input onChange={ appoveValueHandler } placeholder='Value'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ approveHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ approveStatus }</div>
                        </div>
                    )
                }
            </div>
            
            <div className='funcCat'>Use</div>
            <i class="fa-solid fa-shop"></i>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setUseRecipient(null); 
                        setUseAmount(null);
                        setShowUse(!showUse) 
                        setUseStatus(null);
                    } } >
                    <p>Use recipient account's tokens</p>
                </div>
                {
                    showUse && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ useRecipientHAndler } placeholder='Recipient Address'></input>
                                <input onChange={ useAmountHandler } placeholder='Use Amount'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ useHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ useStatus }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setUseFrom(null); 
                        setUseTo(null);
                        setUseValue(null);
                        setShowUseFrom(!showUseFrom) 
                        setUseFromStatus(null);
                    } }>
                    <p>Uses the value amount of a specific account to another</p>
                </div>
                {
                    showUseFrom && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ useFromHandler } placeholder='From address'></input>
                                <input onChange={ useToHandler } placeholder='To address'></input>
                                <input onChange={ useValueHandler } placeholder='Use Amount'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ useFromToHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ useFromStatus }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcCat'>Demo use only</div>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setMint(null); 
                        setShowMint(!showMint) 
                    } }>
                     <p>Mint carbon tokens</p>
                </div>
                {
                    showMint && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ mintValueHandler } placeholder='Amount'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ mintHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ mintStatus }</div>
                        </div>
                    )
                }
            </div>
            <div className='funcDropContainer'>
                <div className='funcItemContainer'
                    onClick={ () => { 
                        setBurn(null); 
                        setShowBurn(!showBurn) 
                    } }>
                    <p>Burn carbon tokens</p>
                </div>
                {
                    showBurn && 
                    (
                        <div className='infoContainer'>
                            <div className='infoItemContainer'>
                                <input onChange={ burnValueHandler } placeholder='Amount'></input>
                            </div>
                            <div className='infoItemContainer'>
                                <button id='transferFunc' onClick={ burnHandler } >Submit</button>
                            </div>
                            <div className='resultContainer'>{ burnStatus }</div>
                        </div>
                    )
                }
            </div>
            
        </div>
      </div>
    )
  }
  
  export default TransferPage

//   <div className='funcItemContainer'>
//   <button onClick={ () => setShowClientID(!showClientID) } >Your ID</button>
//   <p>Your membership account ID</p>
// </div>
// { showClientID && 
//   (   
//       <div className='singleInfoContainer' id='clientID'>{ clientID }</div> 
//   )
// }
// <div className='funcItemContainer'>
//   <button onClick={ () => { fetchTotalSupply(); setShowSupply(!showSupply) } } >Total Supply</button>
//   <p>The total supply number of carbon tokens</p>
// </div>
// { showSupply && 
//   (   
//       <div className='singleInfoContainer'>{ totalSupply }</div> 
//   )
// }
