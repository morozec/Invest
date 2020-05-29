import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { MajorHolders } from './MajorHolders';
import { InsiderRoster } from './InsiderRoster';
import { InsiderTransactions } from './InsiderTransactions';

export function Holders(props) {
    const { isActive, ticker } = props;
    const [ownership, setOwnership] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isActive) return;
        setIsLoading(true);
        const getData = async () => {
            const response = await fetch(`api/YahooFinance/ownership/${ticker}`);
            if (response.status === 204) {
                setOwnership(null);
            } else {
                const data = await response.json();
                console.log(data)
                setOwnership(data);
            }
            setIsLoading(false);
        }
        getData();

    }, [isActive, ticker])

    let content = isLoading
        ? <p><em>Loading...</em></p>
        : ownership === null
            ? <p>No ownership data</p>
            : <Tabs defaultActiveKey="mh">
                <Tab eventKey='mh' title="Major Holders">
                    <MajorHolders
                        majorHoldersBreakdown={ownership.majorHoldersBreakdown}
                        institutionOwnership={ownership.institutionOwnership}
                        fundOwnership={ownership.fundOwnership} />
                </Tab>
                <Tab eventKey='ir' title="Insider Roster">
                    <InsiderRoster
                        insiderHolders={ownership.insiderHolders} />
                </Tab>
                <Tab eventKey='it' title="Insider Transactions">
                    <InsiderTransactions
                        insiderTransactions={ownership.insiderTransactions}
                        netSharePurchaseActivity={ownership.netSharePurchaseActivity} />
                </Tab>
            </Tabs>

    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Ownership</h1>
            </div>
            {content}
        </div>
    )
}