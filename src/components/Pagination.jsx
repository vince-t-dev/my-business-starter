import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function CustomPagination(props) {
    const [activeItem, setActiveItem] = useState(Number(props.page));
    const [pages, setPages] = useState([]);
    const totalPages = Number(props.totalPages);
    const pageRange = 2;
    const maxPages = 5;
    const navigate = useNavigate();   

    // hooks
    // current page 
    useEffect(() => {
        setActiveItem(props.page);
    },[props.page]);
    // total pages
    useEffect(() => {
        if (totalPages) getPages();
    },[totalPages]);

    // previous/next arrows
    const onPrevItem = () => {
        const prevActiveItem = activeItem == 1 ? activeItem : activeItem - 1;
        setActiveItem(prevActiveItem);
        navigate(props.href+prevActiveItem);
    };  
    const onNextItem = (totalPages) => {
        const nextActiveItem = activeItem == totalPages ? activeItem : activeItem + 1; 
        setActiveItem(nextActiveItem);
        navigate(props.href+nextActiveItem);
    };
    // pagination on click
    const handlePaginationChange = (number) => {
        setActiveItem(number);
        navigate(props.href+number);
    };

    // get pages
    const getPages = () => {
        let pages_array = [];
        for (let number = 1; number <= totalPages; number++) {
            pages_array.push({page: number});
        }
        setPages(pages_array);
    }

    // show pages in range
    const setVisiblePages = (page) => {
        let start = props.page - pageRange;
        let end = props.page + pageRange;
        return (page >= start && page <= end && page != totalPages);
    }

    return (
        <>
            { pages.length ?
            <Pagination>
                <Pagination.Prev onClick={onPrevItem}/>
                { pages?.map(a => (
                    setVisiblePages(a.page) ?
                    <Pagination.Item active={props.page == a.page} key={a.page} onClick={e => {handlePaginationChange(a.page)}}>
                        {a.page}
                    </Pagination.Item>
                    :
                    ""
                 )) }
                {/* ellipsis */}
                { totalPages > maxPages && props.page <= totalPages - maxPages && <Pagination.Ellipsis/> }
                {/* last page */
                <Pagination.Item active={props.page == totalPages} key={totalPages} onClick={e => {handlePaginationChange(totalPages)}}>
                { totalPages }
                </Pagination.Item> }
                <Pagination.Next onClick={() => onNextItem(totalPages)}/>
            </Pagination>
            :
            <Pagination>
                <Pagination.Prev/>
                <Pagination.Item active>1</Pagination.Item>
                <Pagination.Next/>
            </Pagination>
            }
        </>
    );
}

export default CustomPagination;