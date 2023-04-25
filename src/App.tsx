import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import formatDistance from 'date-fns/formatDistance';
import { addDoc, collection, doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore';
import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { Oval } from 'react-loader-spinner';
import { firebase } from './index';
import './styles.scss';
import useData, { idLookup, lookupStatus, quantityValues, StatusCategory, StatusItem } from './useData';

function App() {
    const [loading, data] = useData();

    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState<StatusItem | null>(null);
    const [explanation, setExplanation] = useState('');
    const edit = useCallback((item: StatusItem) => {
        return () => {
            setCurrentItem(item);
            setExplanation('');
            setShowModal(true);
        };
    }, []);

    const table = useMemo(() => {
        if (!data) {
            return [];
        }

        return data.map(e => (
            <tr className={
                (e.status && e.type === StatusCategory.Boolean) ?
                    'value-4' :
                    `value-${e.status}`
            }>
                <td><strong>{idLookup[e.id]}</strong></td>
                <td>
                    {lookupStatus(e)}
                    <button onClick={edit(e)}>
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                </td>
                <td>
                    {formatDistance(e.lastUpdated, new Date(), { addSuffix: true })}
                </td>
            </tr>
        ));
    }, [data]);

    const handleUpdate = useCallback((value: number) => {
        if (!currentItem) return;

        setCurrentItem({
            ...currentItem,
            status: value,
        });
    }, [currentItem]);

    const handleExplanationChange = useCallback((e: FormEvent<HTMLTextAreaElement>) => {
        setExplanation((e.target as HTMLTextAreaElement).value);
    }, []);

    const [modalLoading, setModalLoading] = useState(false);
    const submit = useCallback(
        () => {
            if (!currentItem) return;

            setModalLoading(true);
            const db = getFirestore(firebase);
            const dataCollection = collection(db, 'status');
            const logCollection = collection(db, 'reports');
            updateDoc(
                doc(dataCollection, currentItem.id),
                {
                    ...currentItem,
                    lastUpdated: Timestamp.now(),
                },
            )
                .then(() => {
                    addDoc(
                        logCollection,
                        {
                            added: Timestamp.now(),
                            updateType: currentItem.id,
                            updatedTo: lookupStatus(currentItem),
                            message: explanation,
                        },
                    )
                        .then(() => {
                            setModalLoading(false);
                            setShowModal(false);
                        });
                });
        },
        [
            explanation,
            currentItem,
        ],
    );

    return (
        <div className={`app ${showModal ? 'modal-open' : ''}`}>
            <h1>Long Room - status reporting</h1>

            {
                showModal && currentItem && (
                    <div className='edit-modal'>
                        <div className='modal-body'>
                            <div className='modal-header'>
                                Update {idLookup[currentItem.id]} status...
                            </div>
                            <div className='modal-content'>
                                {
                                    currentItem.type === StatusCategory.Boolean ? (
                                        <div className='boolean-status'>
                                            <label htmlFor='status'>
                                                Is the {idLookup[currentItem.id]} currently working?
                                                <input
                                                    type='checkbox'
                                                    id='status'
                                                    className='checkbox'
                                                    disabled={modalLoading}
                                                    checked={currentItem.status === 1}
                                                    onClick={(e) => handleUpdate(
                                                        (e.target as HTMLInputElement).checked ? 1 : 0,
                                                    )}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className='quantitative-status'>
                                            <p>
                                                Select the status that best describes the amount of&nbsp;
                                                <strong>{idLookup[currentItem.id].toLowerCase()}</strong> available.
                                            </p>

                                            <div className='button-stack'>
                                                {
                                                    quantityValues.map((value, i) => (
                                                        <button
                                                            onClick={() => handleUpdate(i)}
                                                            className={`value-${i} ${currentItem.status === i ? 'active' : ''}`}
                                                            disabled={modalLoading}
                                                        >
                                                            {value}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }

                                <label htmlFor='explanation' className='explanation'>
                                    Optionally, add an explanation.&nbsp;
                                    <span className='small'>
                                        (This will only go to prefects and staff, for information on how best to restock:
                                        do not enter any personally identifiable data.)
                                    </span>
                                    <textarea
                                        id='explanation'
                                        className='explanation'
                                        value={explanation}
                                        onInput={handleExplanationChange}
                                        disabled={modalLoading}
                                        placeholder={`What's up with the ${idLookup[currentItem.id].toLowerCase()}?`}
                                    />
                                </label>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={modalLoading}
                                    className='cancel'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={modalLoading}
                                    className='send'
                                >
                                    Send!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                loading || !data ? (
                    <Oval
                        height={100}
                        width={100}
                        color='#ec9481'
                        secondaryColor='#ec9481'
                        wrapperClass='loader'
                    />
                ) : (
                    <table>
                        <tbody>
                            {
                                table
                            }
                        </tbody>
                    </table>
                )
            }

            <div className='floating-attribution'>
                Made with ❤️ by Geza Kerecsenyi & co., 2023.
            </div>
        </div>
    );
}

export default App;
