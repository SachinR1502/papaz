import React, { ReactNode } from 'react';

interface Props {
    providers: Array<React.ComponentType<any>>;
    children: ReactNode;
}

export const ProviderComposer = ({ providers, children }: Props) => {
    return (
        <>
            {providers.reduceRight((acc, Provider) => {
                return <Provider>{acc}</Provider>;
            }, children)}
        </>
    );
};
