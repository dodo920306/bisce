import React, { useState } from "react";
import './TransactionItem.css'
const TransactionItem = (props) => {

    const txID = props.TransactionID
    const txEvent = props.EventName
    const txFrom = props.From
    const txTo = props.To
    const txBlock = props.BlockNumber
    const txValue = props.Value
    const txTime = props.Time


    const sliceTx = (input) => {
        return input.length > 10 ? `${input.substring(0, 5)}...${input.substring(input.length-5, input.length)}` : input;
    }

    const sliceID = sliceTx(txID)
    const sliceFrom = sliceTx(txFrom)
    const sliceTo = sliceTx(txTo)

    const [details, setDetails] = useState(false)

    return (
        <div className="txItemContainer" >
            <li className='listItem' onClick={ () => { setDetails(!details) }}>
                <span>{ txTime }</span>
                <span>{ sliceID }</span>
                <span>{ txEvent }</span>
                <span>{ sliceFrom }</span>
                <span>{ sliceTo }</span>
                <span>{ txValue }</span>
            </li>
            <div className="tipDetail">Click for details</div>
            {
                details &&
                (
                    <div detailsContainer>
                        <div className='detailItem'><div className="detailTitle">ID:</div> { txID }</div>
                        <div className='detailItem'><div className="detailTitle">Block:</div> { txBlock }</div>
                        <div className='detailItem'><div className="detailTitle">From:</div> { txFrom }</div>
                        <div className='detailItem'><div className="detailTitle">To:</div> { txTo }</div>
                    </div>
                )
            }
        </div>
    );
};

export default TransactionItem;
