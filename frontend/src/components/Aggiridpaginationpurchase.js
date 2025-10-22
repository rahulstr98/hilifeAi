import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Button, Skeleton } from '@mui/material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { userStyle } from '../pageStyle';

const AgGridContainer = styled.div`
  .ag-theme-quartz {
    transition: none !important;
    overflow: auto;
  }
  ,
  .ag-pinned-left {
    overflow-x: auto !important;
    max-height: 100%;
  }
`;

const TableSkeleton = ({ rows }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Skeleton
        key={rowIndex}
        variant="rectangular"
        width="100%"
        height={40}
        style={{ marginBottom: 8, opacity: 0.2 }}
        animation="wave"
      />
    ))}
  </Box>
);

function AggridTable({
  rowDataTable,
  columnDataTable,
  columnVisibility,
  page,
  setPage,
  pageSize,
  totalPages,
  setColumnVisibility,
  selectedRows,
  setSelectedRows,
  gridRefTable,
  totalDatas,
  rowHeight = 50,
  setFilteredRowData,
  selectedRowsRequestPurchase,
  setSelectedRowsRequestPurchase,
  filteredRowData,
  gridRefTableImg,
  itemsList,
  selectedRowsAssetList,
  setSelectedRowsAssetList,
  pagenamecheck,
}) {
  ModuleRegistry.registerModules([ClientSideRowModelModule]);

  const [loading, setLoading] = useState(false);
  const [sortingNames, setSortingNames] = useState(null);
  const scrollPositionRef = useRef(0);

  const getRowStyle = (params) =>
    params.node.rowIndex % 2 === 0
      ? { background: '#f0f0f0' }
      : { background: '#ffffff' };

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      resizable: true,
      filterParams: {
        buttons: ['apply', 'reset', 'cancel'],
        closeOnApply: true,
      },
    }),
    []
  );

  const selection = { mode: 'multiRow', headerCheckbox: false };

  const onSortChanged = (params) => {
    const allColumns = params?.columns[0]?.sort;
    setSortingNames(allColumns);
  };

  useEffect(() => {
    // Sync selection with state if necessary
    const syncSelectionWithState = () => {
      const selectedIds = new Set(selectedRows);
      gridRefTable?.current?.api?.forEachNode((node) => {
        node.setSelected(selectedIds.has(node.data.id));
      });
    };
    if (gridRefTable.current) {
      syncSelectionWithState();
    }
  }, [rowDataTable]);

  const onGridReady = useCallback((params) => {
    // If there's a saved filter model, set it back
    const savedFilterModel = localStorage.getItem('filterModel');
    if (savedFilterModel) {
      params.api.setFilterModel(JSON.parse(savedFilterModel));
    }
  }, []);

  const onFilterChanged = () => {
    if (!gridRefTable?.current?.api) return;
    const filterModel = gridRefTable.current.api.getFilterModel();
    localStorage.setItem('filterModel', JSON.stringify(filterModel));

    if (Object.keys(filterModel).length === 0) {
      setFilteredRowData([]);
      setPage(1);
    } else {
      const filteredData = itemsList?.filter((item) =>
        Object?.keys(filterModel)?.every((field) => {
          const filterValue = filterModel[field]?.filter;
          if (!filterValue) return true;
          return item[field]?.toString()?.includes(filterValue);
        })
      );
      setFilteredRowData(filteredData);
    }
  };

  // ✅ Clean pagination handler (API-driven)
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    // store scroll position
    scrollPositionRef.current =
      window.scrollY || document.documentElement.scrollTop;

    setLoading(true);
    setSortingNames(null);

    // reset selections when changing page
    if (pagenamecheck === 'Asset List') {
      setSelectedRowsAssetList([]);
    }
    if (pagenamecheck === 'Stock Request Purchase') {
      setSelectedRowsRequestPurchase([]);
    }
    setSelectedRows([]);

    setPage(newPage); // ✅ trigger API fetch outside

    // simulate fetch delay
    setTimeout(() => {
      setLoading(false);
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto',
        });
      });
    }, 50);
  };

  const handleSelectionChange = () => {
    const selectedRowsNew = gridRefTable?.current?.api?.getSelectedRows() || [];
    const extractedIds = selectedRowsNew.map((item) => item.id);

    if (pagenamecheck === 'Asset List') {
      const extractedIdsAssetList = selectedRowsNew.map((item) => ({
        company: item.company,
        branch: item.branch,
        unit: item.unit,
        floor: item.floor,
        area: item.area,
        location: item.location,
        code: item.code,
        assetmaterial: item.material,
      }));
      if (
        JSON.stringify(extractedIdsAssetList) !==
        JSON.stringify(selectedRowsAssetList)
      ) {
        setSelectedRowsAssetList(extractedIdsAssetList);
      }
    }

    if (pagenamecheck === 'Stock Request Purchase') {
      if (
        JSON.stringify(selectedRowsNew) !==
        JSON.stringify(selectedRowsRequestPurchase)
      ) {
        setSelectedRowsRequestPurchase(selectedRowsNew);
      }
    }

    if (JSON.stringify(extractedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(extractedIds);
    }
  };

  const handleColumnMoved = useCallback(
    debounce((event) => {
      if (!event.columnApi) return;
      const visible_columns = event.columnApi
        .getAllColumns()
        .filter((col) => {
          const colState = event.columnApi
            .getColumnState()
            .find((state) => state.colId === col.colId);
          return colState && !colState.hide;
        })
        .map((col) => col.colId);

      setColumnVisibility((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(
          (colId) => (updated[colId] = visible_columns.includes(colId))
        );
        return updated;
      });
    }, 300),
    []
  );

  const handleColumnVisible = useCallback((event) => {
    const colId = event.column.getColId();
    setColumnVisibility((prev) => ({
      ...prev,
      [colId]: event.visible,
    }));
  }, []);

  // pagination buttons range
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(
    firstVisiblePage + visiblePages - 1,
    totalPages
  );
  const pageNumbers = [];
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Box style={{ width: '100%', overflowY: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={pageSize} />
        ) : (
          <AgGridContainer>
            <div className={'ag-theme-quartz'} ref={gridRefTableImg}>
              <AgGridReact
                rowData={rowDataTable}
                columnDefs={columnDataTable
                  ?.filter((col) => columnVisibility[col.field])
                  ?.map((data) => ({
                    ...data,
                    headerName: data.field === 'checkbox' ? '' : data.headerName,
                    filter: ['checkbox', 'actions'].includes(data.field)
                      ? false
                      : data.filter,
                    sortable: true,
                  }))}
                ref={gridRefTable}
                defaultColDef={defaultColDef}
                domLayout={'autoHeight'}
                selection={selection}
                rowSelection="multiple"
                onSelectionChanged={handleSelectionChange}
                getRowStyle={getRowStyle}
                pagination={false} // ✅ disable AG Grid pagination
                suppressColumnVirtualisation={true}
                onGridReady={onGridReady}
                onColumnMoved={handleColumnMoved}
                onColumnVisible={handleColumnVisible}
                onFilterChanged={onFilterChanged}
                suppressHorizontalScroll={false}
                suppressSizeToFit={true}
                suppressAutoSize={true}
                colResizeDefault={'shift'}
                getRowHeight={() => rowHeight}
                suppressRowClickSelection={true}
                rowMultiSelectWithClick={true}
                onSortChanged={onSortChanged}
              />
            </div>
          </AgGridContainer>
        )}
      </Box>

      {/* ✅ Custom Pagination Footer */}
      <Box style={userStyle.dataTablestyle}>
        <Box>
          Showing{' '}
          {rowDataTable.length > 0
            ? (page - 1) * pageSize + 1
            : 0}{' '}
          to {Math.min(page * pageSize, totalDatas)} of {totalDatas} entries
        </Box>
        <Box>
          <Button
            onClick={() => handlePageChange(1)}
            disabled={page === 1 || totalPages === 0}
            sx={userStyle.paginationbtn}
          >
            <FirstPageIcon />
          </Button>
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || totalPages === 0}
            sx={userStyle.paginationbtn}
          >
            <NavigateBeforeIcon />
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              onClick={() => handlePageChange(p)}
              className={page === p ? 'active' : ''}
              disabled={page === p || totalPages === 0}
              sx={userStyle.paginationbtn}
            >
              {p}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            sx={userStyle.paginationbtn}
          >
            <NavigateNextIcon />
          </Button>
          <Button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages || totalPages === 0}
            sx={userStyle.paginationbtn}
          >
            <LastPageIcon />
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default AggridTable;
