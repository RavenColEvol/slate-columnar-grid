import React from 'react';
import Types from './Types';

export default function ({content}) {
    const schema = content['schema'] || [];
    return(
        <div>
            {schema.map(field => <div key={field.uid}>{field.display_name} <Types/></div>)}
        </div>
    )
}