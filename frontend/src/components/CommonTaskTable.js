import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TablePagination
} from '@mui/material';
const CommonTaskTable = ({ data, currentPage, setCurrentPage, rowsPerPage = 5, handleComplete, handleUndo, disable }) => {
    const totalRows = data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginatedData = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage + 1); // MUI uses 0-indexed pages
    };

      function convertTo12HourFormat(time24) {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12; // Convert '0' to '12'
    const formattedHour = hour.toString().padStart(2, '0');

    return `${formattedHour}:${minute} ${ampm}`;
  }

    return (
        <Paper elevation={1}>
            <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" aria-label="compact task table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow sx={{ height: 28 }}>
                            {[
                                'Category', 'Subcategory', 'Status', 'User',
                                'Assigned Date', 'Frequency', 'Schedule', 'Time', 'Action'
                            ].map((heading, i) => (
                                <TableCell
                                    key={i}
                                    sx={{
                                        fontSize: '0.55rem',
                                        fontWeight: 500,
                                        padding: '4px 6px'
                                    }}
                                >
                                    {heading}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedData.map((task, index) => (
                            <TableRow key={index} sx={{ height: 28 }}>
                                <TableCell sx={{ fontSize: '0.4375rem', padding: '2px 4px' }}>{task.category}</TableCell>
                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.subcategory}</TableCell>
                                <TableCell
                                    sx={{
                                        fontSize: '0.4rem',
                                        padding: '2px 4px',
                                        color: task.taskstatus === "Completing" ? 'green' : 'inherit'
                                    }}
                                >
                                    {task.taskstatus}
                                </TableCell>                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.username}</TableCell>
                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.taskassigneddate}</TableCell>
                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.frequency}</TableCell>
                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.schedule}</TableCell>
                                <TableCell sx={{ fontSize: '0.4rem', padding: '2px 4px' }}>{task.timetodo?.length > 0 ?
                                    `${task.timetodo[0]?.hour}:${task.timetodo[0]?.min} ${task.timetodo[0]?.timetype}` :  
                                    (task?.taskdetails === "nonschedule" &&  task?.tasktime )? convertTo12HourFormat(task?.tasktime):""}</TableCell>
                                <TableCell sx={{ padding: '2px 4px' }}>
                                    {task.taskstatus === 'Completing' ? (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            size="small"
                                            disabled={disable}
                                            sx={{
                                                fontSize: '0.6rem',
                                                padding: '2px 6px',
                                                minWidth: 'unset',
                                                lineHeight: 1
                                            }}
                                            onClick={() => handleUndo(index)}
                                        >
                                            Undo
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                fontSize: '0.6rem',
                                                padding: '2px 6px',
                                                minWidth: 'unset',
                                                lineHeight: 1
                                            }}
                                            disabled={disable}
                                            onClick={() => handleComplete(index)}
                                        >
                                            Complete
                                        </Button>
                                    )}
                                </TableCell>


                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={totalRows}
                page={currentPage - 1}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5]}
                labelRowsPerPage=""
                sx={{
                    fontSize: '0.6rem',
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        fontSize: '0.6rem'
                    },
                    '.MuiTablePagination-actions': {
                        fontSize: '0.6rem'
                    },
                    '.MuiIconButton-root': {
                        padding: '4px'
                    }
                }}
            />
        </Paper>
    );
};

export default CommonTaskTable;
