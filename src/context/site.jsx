import React, { useContext, createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

// global site settings
const siteContext = createContext();
export function SiteContext({ children }) {
	const site = useSiteContext();
	return <siteContext.Provider value={site}> { children } </siteContext.Provider>
}
export const useSite = () => useContext(siteContext);

// site context/utilities
function useSiteContext() {
    // apply global values settings here
    // TODO centralize ids and url
    let site_config = {
        showPreloader: false,
        documentTitle: document.title,
        ArticleSectionId: 6137
    }
	const [siteConfig, setSiteConfig] = useState(site_config);

    // update config
    const useUpdateSiteConfig = (value) => {
        setSiteConfig(value);
    };

    // get previous state
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
          	ref.current = value;
        });
        return ref.current;
    };

    // use update effect (useeffect but not trigger on mount)
    const useUpdateEffect = (func, deps) => {
        const didMount = useRef(false);
        return useEffect(() => {
            if (didMount.current) func();
            else didMount.current = true;
        }, deps);
    }

    // debounce
    const useDebounce = (value, delay = 500) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
              	setDebouncedValue(value);
            }, delay);
            return () => {
              	clearTimeout(handler);
            };
        },[value, delay]);
        return debouncedValue;
    }

	// update nested object
    const useUpdateObject = (object, path, value) => {
        let schema = object;  
        let p_list = path.split(".");
        let len = p_list.length;
        for(let i = 0; i < len-1; i++) {
            let elem = p_list[i];
            if( !schema[elem] ) schema[elem] = {}
            schema = schema[elem];
        }
        schema[p_list[len-1]] = value;
        return schema;
    }

	// set document title
	const useDocumentTitle = (title) => {
		document.title = title ? title + " - " + site_config.documentTitle : site_config.documentTitle;
	}

    // table sorting
    const useSortableData = (items, config = null) => {
        const [sortConfig, setSortConfig] = useState(config);
        const sortedItems = useMemo(() => {
            let sortableItems = items ? [...items] : [];
            if (sortConfig !== null) {
                sortableItems.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    } 
                    return 0;
                });
            }
            return sortableItems;
        }, [items, sortConfig]);
      
        const requestSort = (key) => {
            let direction = "ascending";
            if (
                sortConfig &&
                sortConfig.key === key &&
                sortConfig.direction === "ascending"
            ) {
                direction = "descending";
            }
            setSortConfig({ key, direction });
        };
      
        return { sorteditems: sortedItems, requestSort, sortConfig };
    };

    /**
     * These hooks re-implement the now removed useBlocker and usePrompt hooks in 'react-router-dom' v6.
     */
    /**
     * Blocks all navigation attempts. This is useful for preventing the page from
     * changing until some condition is met, like saving form data.
     */
    const useBlocker = (blocker, when = true, modal) => {
        const { navigator } = useContext( NavigationContext );
        useEffect( () => {
            if (!when) return;
            const unblock = navigator.block( ( tx ) => {
                const autoUnblockingTx = {
                    ...tx,
                    retry() {
                        unblock();
                        tx.retry();
                    },
                };

                blocker( autoUnblockingTx );
                //modal({type: "leave-screen"});
            } );

            return unblock;
        }, [ navigator, blocker, when ] );
    }
    /**
     * Prompts the user with an Alert before they leave the current screen.
     */
    const usePrompt = (message, when = true, modal) => {
        const blocker = useCallback(
            ( tx ) => {
                if (window.confirm(message)/*when*/) tx.retry();
            },
            [message]
        );
        useBlocker( blocker, when );
    }

    return { siteConfig, useUpdateSiteConfig, usePrevious, useDebounce, useUpdateObject, useDocumentTitle, useUpdateEffect, useSortableData, usePrompt };
}