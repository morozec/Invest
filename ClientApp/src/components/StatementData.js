import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';

export function StatementData(props) {
    const [yearData, setYearsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const {statementType, statementTitle, isActive} = props;

    

    useEffect(() => {
        if (!isActive) return;
        if (yearData) return;

        const years = [2015, 2016, 2017, 2018, 2019];
        const ibmId = 69543;

        const getData = async (companyId, year) => {
            const response = await fetch(`api/simfin/${statementType}/${companyId}/${year}`);
            const data = await response.json();
            return data;
        }

        let promises = years.map(year => getData(ibmId, year))

        Promise.all(promises).then((results) => {
            console.log(results);
            setYearsData(results);
            setIsLoading(false);
        });

    }, [isActive, yearData, statementType])



    let content;
    if (isLoading) {
        content = <p><em>Loading...</em></p>;
    } else {
        const propNames = yearData[0].values.map(v => v.standardisedName);
        content = (
            <Table striped bordered hover variant="light">
                <thead>
                    <tr>
                        <th>Breakdown</th>
                        {yearData.map((data, i) => <th key={i}>{data.periodEndDate}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {propNames.map((name, i) => {
                        return (
                            <tr key={i}>
                                <td>{name}</td>
                                {yearData.map((data, j) => <td key={j}>{data.values[i].valueChosen}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        )
    }



    return (
        <div>
            <h1>IBM {statementTitle}</h1>
            {content}
        </div>
    )
}

