import React, { Fragment, useState, useEffect } from 'react'
import { Table, Button, Modal } from 'react-bootstrap';
import { RatioHelper, GROUPS } from './../RatiosHelper';
import { Link } from 'react-router-dom';

export function Comparing(props) {
    const { comparingCompanies, removeComparingCompany } = props;
    const groupedRatios = comparingCompanies.map(c => (new RatioHelper(c.ratios)).getGroupedRatios());
    const EPS = 1E-3;

    const [visibility, setVisibility] = useState({});
    const [visibilityTmp, setVisibilityTmp] = useState({});
    const [showSettings, setShowSettings] = useState(false);

    const recommendationsNames = ['Consensus', 'Average Price Target', 'Upside to Average Price Target'];

    useEffect(() => {
        let startVisibility = {};
        for (let groupName of Object.keys(GROUPS)) {
            startVisibility[groupName] = true;
            for (let ratioName of GROUPS[groupName]) {
                startVisibility[ratioName] = true;
            }
        }
        startVisibility.Recommendations = true;
        for (let rn of recommendationsNames){
            startVisibility[rn] = true;
        }

        setVisibility(startVisibility);
        setVisibilityTmp(startVisibility);
    }, [])

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

    const handleShowSettings = () => {
        setVisibilityTmp(visibility);
        setShowSettings(true);
    }
    const handleHideSettings = () => {
        setShowSettings(false);
    }

    const isGroup = (name) => name === 'Recommendations' || GROUPS.hasOwnProperty(name);

    const handleVisibilityChanged = (name, e) => {
        let vt = { ...visibilityTmp};
        vt[name] = e.target.checked;
        if (GROUPS.hasOwnProperty(name)){
            for (let ratioName of GROUPS[name]){
                vt[ratioName] = e.target.checked;
            }
        }else if (name === 'Recommendations'){
            for (let rn of recommendationsNames){
                vt[rn] = e.target.checked;
            }
        }else{
            if (!recommendationsNames.some(rn => rn === name)){
                let groupName = Object.keys(GROUPS).filter(g => GROUPS[g].some(rn => rn === name))[0];
                if (GROUPS[groupName].every(rn => vt[rn] === e.target.checked)){
                    vt[groupName] = e.target.checked;
                }
            }else{
                if (recommendationsNames.every(rn => vt[rn] === e.target.checked)){
                    vt['Recommendations'] = e.target.checked;
                }
            }
        }
        setVisibilityTmp(vt);
    }

    const saveSetting = () => {
        setVisibility(visibilityTmp);
        setShowSettings(false);
    }

  

    return (
        <div>
            <div className='d-flex'>
                <Button variant='outline-primary' className='ml-auto' onClick={handleShowSettings}>Settings</Button>
            </div>

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
                                {`${c.profile.name} (${c.profile.ticker}) `}
                            </Link>

                            <Button variant='outline-danger' onClick={() => handleDelete(c.simId)}>Delete</Button>
                        </th>)}
                    </tr>
                </thead>
                <tbody>

                    {Object.keys(GROUPS).filter(groupName => visibility[groupName]).map(groupName =>
                        <Fragment key={groupName}>
                            <tr className='groupName'>
                                <th colSpan={comparingCompanies.length + 1} className='centered'>{groupName}</th>
                            </tr>
                            {GROUPS[groupName].filter(ratioName => visibility[ratioName]).map((ratioName, i) =>
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

                    {visibility.Recommendations &&
                        <Fragment>
                            <tr className='groupName'>
                                <th colSpan={comparingCompanies.length + 1} className='centered'>Recommendations</th>
                            </tr>

                            {visibility.Consensus &&
                                <Fragment>
                                    <tr>
                                        <td>Consensus</td>
                                        {comparingCompanies.map((c, i) => <td key={i}
                                            className={getNumberClass(
                                                getRecommendation(c.recommendations), comparingCompanies.map(cc => getRecommendation(cc.recommendations)))}>
                                            {getRecommendationText(getRecommendation(c.recommendations))}
                                        </td>)}
                                    </tr>
                                </Fragment>
                            }

                            {visibility['Average Price Target'] &&
                                <Fragment>
                                    <tr>
                                        <td>Average Price Target</td>
                                        {comparingCompanies.map((c, i) => <td key={i} className='value'>{`$${c.priceTargets.targetMean}`}</td>)}
                                    </tr>
                                </Fragment>
                            }

                            {visibility['Upside to Average Price Target'] &&
                                <Fragment>
                                    <tr>
                                        <td>Upside to Average Price Target</td>
                                        {comparingCompanies.map((c, i) => <td key={i}
                                            className={getNumberClass(getUpside(c), comparingCompanies.map(cc => getUpside(cc)))}>
                                            {`${getUpside(c)}%`}
                                        </td>)}
                                    </tr>
                                </Fragment>
                            }

                        </Fragment>
                    }

                </tbody>
            </Table>

            <Modal show={showSettings} onHide={handleHideSettings}>
                <Modal.Header closeButton>
                    <Modal.Title>Comparison settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered hover variant='light' className='table-sm'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Visibility</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(visibilityTmp).map((name, i) =>
                                <tr key={i} className={isGroup(name) ? 'groupName' : ''}>
                                    {isGroup(name) && <th>{name}</th>}
                                    {!isGroup(name) && <td>{name}</td>}

                                    <td className='centered'>
                                        <input type='checkbox' checked={visibilityTmp[name]} onChange={(e) => handleVisibilityChanged(name, e)}>

                                        </input>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHideSettings}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={saveSetting}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}