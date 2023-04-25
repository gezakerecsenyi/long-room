import { collection, getFirestore, onSnapshot, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firebase } from './index';

export enum StatusCategory {
    Boolean = 'boolean',
    Quantity = 'quantity',
}

export interface StatusDocCommon {
    status: number;
    type: StatusCategory;
}

export interface StatusDoc extends StatusDocCommon {
    lastUpdated: Timestamp;
}

export interface StatusItem extends StatusDocCommon {
    id: StatusType;
    lastUpdated: Date;
}

export enum StatusType {
    Coffee = 'coffee',
    Tea = 'teabags',
    Cups = 'cups',
    Mugs = 'mugs',
    HotWaterMachine = 'hotWaterMachine',
    Milk = 'milk',
    Microwave = 'microwave',
}

export const idLookup = {
    [StatusType.Coffee]: 'Coffee',
    [StatusType.Tea]: 'Teabags',
    [StatusType.Cups]: 'Paper cups',
    [StatusType.Mugs]: 'Mugs',
    [StatusType.HotWaterMachine]: 'Hot water machine',
    [StatusType.Milk]: 'Milk',
    [StatusType.Microwave]: 'Microwave',
};

export const quantityValues = [
    'Reported empty',
    'Running low...',
    'Still some left to go',
    'Plenty to go!',
    'Fully stocked!',
];
export const booleanValues = [
    'Reported broken!',
    'Seemingly working!',
];

export function lookupStatus(item: StatusItem) {
    return item.type === StatusCategory.Quantity ? quantityValues[item.status] : booleanValues[item.status];
}

export default function useData(): [boolean, StatusItem[] | null] {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<StatusItem[] | null>(null);

    const db = getFirestore(firebase);
    const dataCollection = collection(db, 'status');

    useEffect(() => {
        return onSnapshot(dataCollection, (data) => {
            setIsLoading(false);
            setData(
                data.docs.map(doc => {
                    const data = doc.data() as StatusDoc;

                    return (
                        {
                            ...data,
                            lastUpdated: data.lastUpdated.toDate(),
                            id: doc.id as StatusType,
                        }
                    );
                }),
            );
        });
    }, []);

    return [
        isLoading,
        data,
    ];
}