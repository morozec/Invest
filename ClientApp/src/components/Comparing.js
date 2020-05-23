import React, { Fragment } from 'react'
import { Table, Button } from 'react-bootstrap';
import { RatioHelper, GROUPS } from './../RatiosHelper';
import { Link } from 'react-router-dom';

export function Comparing(props) {
    const { comparingCompanies, removeComparingCompany } = props;
    const groupedRatios = comparingCompanies.map(c => (new RatioHelper(c.ratios)).getGroupedRatios());
    const EPS = 1E-3;

    const getRatioClass = (companyRatio, allCompaniesValues) => {
        const min = Math.min(...allCompaniesValues);
        const max = Math.max(...allCompaniesValues);

        if (companyRatio.comparingCoeff === 0 || allCompaniesValues.length === 1) return 'value';
        if (companyRatio.comparingCoeff === 1) {
            if (companyRatio.value === max) {
                return `value best`;
            } else if (companyRatio.value === min) {
                return 'value worst';
            } else {
                return 'value';
            }
        }

        if (companyRatio.value === min) {
            if (companyRatio.value >= 0) return 'value best';
            if (companyRatio.value === min) return 'value worst';
            if (companyRatio.value === max) return 'value best';
            return 'value';
        } else if (companyRatio.value === max) {
            if (companyRatio.value < 0) return 'value best';
            if (min >= 0) return 'value worst';
            if (allCompaniesValues.every(v => v < 0 || v === companyRatio.value)) return 'value best';
            return 'value';
        } else {
            return 'value';
        }
    }

    const getRecommendation = (recommendations) => {
        let score = 0;
        let count = 0;
        let lastRecs = recommendations[recommendations.length - 1];
        score += lastRecs.strongSell * 1;
        count += lastRecs.strongSell;

        score += lastRecs.sell * 2;
        count += lastRecs.sell;

        score += lastRecs.hold * 3;
        count += lastRecs.hold;

        score += lastRecs.buy * 4;
        count += lastRecs.buy;

        score += lastRecs.strongBuy * 5;
        count += lastRecs.strongBuy;

        score /= count;

        return Math.round(score);
    }

    const getRecommendationText = (score) => {
        return score === 1
            ? "Strong Sell"
            : score === 2
                ? "Sell"
                : score === 3
                    ? "Hold"
                    : score === 4
                        ? "Buy"
                        : "Strong Buy";
    }

    const getNumberClass = (companyNumber, allCompaniesNumbers) => {
        let min = Math.min(...allCompaniesNumbers);
        let max = Math.max(...allCompaniesNumbers);
        if (Math.abs(min - max) < EPS || (companyNumber > min + EPS && companyNumber < max - EPS)) return 'value';
        if (companyNumber < min + EPS) return 'value worst';
        return 'value best';
    }

    const getUpside = (company) => {
        const targetMean = company.priceTargets.targetMean;
        const lastClosingPrice = + company.ratios.filter(r => r.indicatorName === 'Last Closing Price')[0].value;
        return ((targetMean - lastClosingPrice) / lastClosingPrice * 100).toFixed(2);
    }

    const handleDelete = (companySimId) => {
        removeComparingCompany(companySimId);
    }

    return (
        <div>
            <Table bordered hover variant='light' className='table-sm'>
                <thead>
                    <tr>
                        <th>Company</th>
                        {comparingCompanies.map((c, i) => <th key={i} className='centered'>

                            <Link to={{
                                pathname: '/stock',
                                search: `t=${c.profile.ticker}`,
                                state: {
                                    simId: c.simId,
                                    name: c.profile.name
                                }
                            }}>
                                {`${c.profile.name} (${c.profile.ticker})`}
                            </Link>

                            <Button variant='outline-danger' onClick={() => handleDelete(c.simId)}>Delete</Button>
                        </th>)}
                    </tr>
                </thead>
                <tbody>

                    {Object.keys(GROUPS).map(groupName =>
                        <Fragment key={groupName}>
                            <tr className='groupName'>
                                <th colSpan={comparingCompanies.length + 1} className='centered'>{groupName}</th>
                            </tr>
                            {GROUPS[groupName].map((ratioName, i) =>
                                <tr key={i}>
                                    <td>
                                        {ratioName}
                                    </td>
                                    {groupedRatios.map((gr, j) => <td key={j}
                                        className={getRatioClass(gr[groupName][ratioName], groupedRatios.map(gr => gr[groupName][ratioName].value))}>
                                        {gr[groupName][ratioName].displayValue}
                                    </td>)}
                                </tr>
                            )}
                        </Fragment>
                    )}

                    <tr className='groupName'>
                        <th colSpan={comparingCompanies.length + 1} className='centered'>Recommendations</th>
                    </tr>
                    <tr>
                        <td>Consensus</td>
                        {comparingCompanies.map((c, i) => <td key={i}
                            className={getNumberClass(
                                getRecommendation(c.recommendations), comparingCompanies.map(cc => getRecommendation(cc.recommendations)))}>
                            {getRecommendationText(getRecommendation(c.recommendations))}
                        </td>)}
                    </tr>

                    <tr>
                        <td>Average Price Target</td>
                        {comparingCompanies.map((c, i) => <td key={i} className='value'>{`$${c.priceTargets.targetMean}`}</td>)}
                    </tr>

                    <tr>
                        <td>Upside to Average Price Target</td>
                        {comparingCompanies.map((c, i) => <td key={i}
                            className={getNumberClass(getUpside(c), comparingCompanies.map(cc => getUpside(cc)))}>
                            {`${getUpside(c)}%`}
                        </td>)}
                    </tr>

                </tbody>
            </Table>
        </div>
    )
}