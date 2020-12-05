import React, { useContext, useRef } from 'react';

import { isEqual } from 'lodash';
import { ReactEditor, useSlate } from 'slate-react';

export const CurrentSelectionContext = React.createContext({ current: null });

export function withCurrentSelection(WrappedComponent) {
  return React.forwardRef((props, ref) => {
    const editor = useSlate();
    const currentSelection = useRef(editor.selection);
    if (ReactEditor.isFocused(editor)) {
      if (!isEqual(currentSelection.current, editor.selection)) {
        currentSelection.current = editor.selection;
      }
    }

    return (
      <CurrentSelectionContext.Provider
        value={{
          current: currentSelection.current,
        }}
      >
        <WrappedComponent {...props} ref={ref} />
      </CurrentSelectionContext.Provider>
    );
  });
}
export const useCurrentSelection = () => useContext(CurrentSelectionContext);