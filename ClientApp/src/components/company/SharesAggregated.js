import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Container } from 'react-bootstrap';

export function SharesAggregated(props) {
    const { isActive, ticker, simfinId } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [sharesAggregatedData, setSharesAggregatedData] = useState(null);
    const [sharesAggregatedDataChanges, setSharesAggregatedDataChanges] = useState(null);


    useEffect(() => {
        if (!isActive) return;
        if (sharesAggregatedData) return;

        setIsLoading(true);

        const getData = async (companyId) => {
            const response = await fetch(`api/simfin/sharesAggregated/${companyId}`);
            const data = await response.json();
            return data.filter(d => d.period === 'Q1' || d.period === 'Q2' || d.period === 'Q3' || d.period === 'Q4');
        }

        getData(simfinId).then(result => {
            console.log(result);
            setSharesAggregatedData(result);
            let changes = [0, 0, 0, 0];
            for (let i = 4; i < result.length; ++i) {
                let change = ((result[i].value - result[i - 4].value) / result[i - 4].value * 100).toFixed(2);
                changes.push(change);
            }
            setSharesAggregatedDataChanges(changes);

            setIsLoading(false);
        })

    }, [isActive, simfinId, sharesAggregatedData])

    const getBillions = (value) => {
        return (+value / 1e9).toFixed(3);
    }

    let content;

    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        content =
            <Container className='sharesAggregatedContainer'>
                <div>
                    <Bar
                        data={{
                            labels: sharesAggregatedData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'Quarterly Shares Outstanding, B',
                                    backgroundColor: `rgba(0, 0, 255, 0.6)`,
                                    borderWidth: 1,
                                    hoverBackgroundColor: `rgba(0, 0, 255, 1)`,
                                    hoverBorderColor: `rgba(0, 0, 255, 1)`,
                                    data: sharesAggregatedData.map(sa => getBillions(sa.value)),
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>

                <div>
                    <Bar
                        data={{
                            labels: sharesAggregatedData.map(sa => sa.date),
                            datasets:
                                [{
                                    label: 'YoY Quarterly Growth, %',
                                    backgroundColor: sharesAggregatedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 0.6)` : `rgba(255, 0, 0, 0.6)`),
                                    borderWidth: 1,
                                    hoverBackgroundColor: sharesAggregatedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    hoverBorderColor: sharesAggregatedDataChanges.map(c =>
                                        c >= 0 ? `rgba(0, 255, 0, 1)` : `rgba(255, 0, 0, 1)`),
                                    data: sharesAggregatedDataChanges,
                                }]
                        }}
                        options={{
                            responsive: true,
                        }} />
                </div>
            </Container>
    }


    return (
        <div>
            <div className='statementHeader'>
                <h1>{ticker} Shares Outstanding</h1>
            </div>
            {content}

        </div >
    )
}

