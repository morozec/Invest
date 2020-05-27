import React, { Fragment, useState, useEffect } from 'react'
import { Table, Button, Modal } from 'react-bootstrap';
import { RatioHelper, GROUPS } from './../RatiosHelper';
import { Link } from 'react-router-dom';

export function Comparing(props) {
    const { comparingCompanies, removeComparingCompany } = props;
    const EPS = 1E-3;

    const [visibility, setVisibility] = useState({});
    const [visibilityTmp, setVisibilityTmp] = useState({});
    const [showSettings, setShowSettings] = useState(false);

    const recommendationsNames = ['Consensus', 'Average Price Target', 'Upside to Average Price Target'];

    useEffect(() => {
        let startVisibility = {};
        for (let group of GROUPS) {
            startVisibility[group.name] = true;
            for (let index of group.indexes) {
                startVisibility[index.name] = true;
            }
        }
        startVisibility.Recommendations = true;
        for (let rn of recommendationsNames){
            startVisibility[rn] = true;
        }

        setVisibility(startVisibility);
        setVisibilityTmp(startVisibility);
    }, [])

    const getIndexClass = (companyIndex, companyValue, allCompaniesValues) => {
        const min = Math.min(...allCompaniesValues);
        const max = Math.max(...allCompaniesValues);

        if (companyIndex.comparingCoeff === 0 || allCompaniesValues.length === 1) return 'value';
        if (companyIndex.comparingCoeff === 1) {
            if (companyValue === max) {
                return `value best`;
            } else if (companyValue === min) {
                return 'value worst';
            } else {
                return 'value';
            }
        }

        if (companyValue === min) {
            if (companyValue >= 0) return 'value best';
            if (companyValue === min) return 'value worst';
            if (companyValue === max) return 'value best';
            return 'value';
        } else if (companyValue === max) {
            if (companyValue < 0) return 'value best';
            if (min >= 0) return 'value worst';
            if (allCompaniesValues.every(v => v < 0 || v === companyValue)) return 'value best';
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
        const lastClosingPrice = company.profile.summaryDetail.previousClose.raw;
        return ((targetMean - lastClosingPrice) / lastClosingPrice * 100).toFixed(2);
    }

    const handleShowSettings = () => {
        setVisibilityTmp(visibility);
        setShowSettings(true);
    }
    const handleHideSettings = () => {
        setShowSettings(false);
    }

    const isGroup = (name) => name === 'Recommendations' || GROUPS.some(g => g.name === name);

    const handleVisibilityChanged = (name, e) => {
        let vt = { ...visibilityTmp};
        vt[name] = e.target.checked;
        let group = GROUPS.filter(g => g.name === name)[0];
        if (group !== undefined){
            for (let index of group.indexes){
                vt[index.name] = e.target.checked;
            }
        }else if (name === 'Recommendations'){
            for (let rn of recommendationsNames){
                vt[rn] = e.target.checked;
            }
        }else{
            if (!recommendationsNames.some(rn => rn === name)){
                let group = GROUPS.filter(g => g.indexes.some(index => index.name === name))[0];
                if (group.indexes.every(index => vt[index.name] === e.target.checked)){
                    vt[group.name] = e.target.checked;
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

            <Table bordered hover variant='light' className='table-sm comparingTable'>
                <thead>
                    <tr>
                        <th className='comparingTableCol0'>Company</th>
                        {comparingCompanies.map((c, i) => <th key={i} className='centered'>

                            <Link to={{
                                pathname: '/stock',
                                search: `t=${c.profile.quoteType.symbol}`,
                            }}>
                                {`${c.profile.quoteType.longName} (${c.profile.quoteType.symbol}) `}
                            </Link>

                            <Button variant='outline-danger' onClick={() => removeComparingCompany(c.profile.quoteType.symbol)}>Delete</Button>
                        </th>)}
                    </tr>
                </thead>
                <tbody>

                    {GROUPS.filter(g => visibility[g.name]).map(g =>
                        <Fragment key={g.name}>
                            <tr className='groupName'>
                                <th colSpan={comparingCompanies.length + 1} className='centered'>{g.name}</th>
                            </tr>
                            {g.indexes.filter(index => visibility[index.name]).map((index, i) =>
                                <tr key={i}>
                                    <td>
                                        {index.name}
                                    </td>
                                    {comparingCompanies.map((c, j) => <td key={j}
                                        className={getIndexClass(
                                            index,
                                            c.profile[index.profileGroup][index.name].raw, 
                                            comparingCompanies.map(c => c.profile[index.profileGroup][index.name].raw))}>
                                        {c.profile[index.profileGroup][index.name].fmt}
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