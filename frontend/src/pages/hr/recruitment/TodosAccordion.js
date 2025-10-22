import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Typography,
    Button,
    IconButton,
    FormControl,
    OutlinedInput,
    CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Selects from 'react-select';

const TodosAccordion = ({fromEmployee=false, todoscheck, setTodoscheck, loading, handleCandidateUploadForIndex, handleCopyTemplate, colourStyles, candidate_educational_upload_status, renderFilePreview, readOnly }) => {
    // Group todos by category and subcategory
    const grouped = todoscheck.reduce((acc, todo) => {
        const cat = todo.category || 'Uncategorized';
        const subcat = todo.subcategory || 'Unspecified';
        acc[cat] = acc[cat] || {};
        acc[cat][subcat] = acc[cat][subcat] || [];
        acc[cat][subcat].push(todo);
        return acc;
    }, {});

    return (
        Object.entries(grouped).map(([category, subcats]) => (
            <Accordion key={category}
            // defaultExpanded
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {Object.entries(subcats).map(([subcategory, items]) => (
                        <Accordion key={subcategory} sx={{ mb: 2 }}
                        // defaultExpanded
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{subcategory}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {items.map((todo, index) => (
                                    <Accordion key={index} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>{todo.candidatefilename || 'Unnamed File'}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography sx={{ fontWeight: 600 }}>
                                                        {todo.name || ''}
                                                        {todo.uploadedby && !fromEmployee && (
                                                            <Button
                                                                size="small"
                                                                sx={{
                                                                    background: todo.uploadedby === 'candidiate' ? 'green' : todo.uploadedby === 'employee' ? 'orange' : 'brown',
                                                                    color: todo.uploadedby === 'employee' ? 'black' : 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold',
                                                                    ml: 1,
                                                                }}
                                                            >
                                                                {todo.uploadedby}
                                                            </Button>
                                                        )}
                                                    </Typography>

                                                    {todo.linkname && todo.status === 'Pending' && !fromEmployee && (
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            onClick={() => handleCopyTemplate({ ...todo, documenttype: todo?.candidatefilename }, "Others")}
                                                            disabled={loading}
                                                        >
                                                            {loading ? <CircularProgress size={16} /> : 'Email Template'}
                                                        </Button>
                                                    )}

                                                    {todo.name && todo.status === 'Uploaded' && (
                                                        <>
                                                            <IconButton onClick={() => renderFilePreview(readOnly ? todo : todo.file)

                                                            } size="small" color="primary">
                                                                <VisibilityOutlinedIcon />
                                                            </IconButton>
                                                            {!readOnly &&
                                                                <IconButton onClick={() => {
                                                                    const updated = [...todoscheck];
                                                                    const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                    if (idx !== -1) {

                                                                        updated[idx].status = "Pending";
                                                                        updated[idx].deadlinedate = "";
                                                                        updated[idx].reason = "";
                                                                        updated[idx].uploadedby = "";
                                                                        updated[idx].name = "";
                                                                        updated[idx].file = null;
                                                                        setTodoscheck(updated);
                                                                    }
                                                                }} size="small" color="error">
                                                                    <DeleteIcon />
                                                                </IconButton>}
                                                        </>
                                                    )}
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                                        <strong>Page Type:</strong> {todo.pagetype || 'N/A'} |&nbsp;
                                                        <strong>Max Size:</strong> {todo.size || '0'} {todo.sizeunit || ''} |&nbsp;
                                                        <strong>Accepted Types:</strong> {Array.isArray(todo.type) ? todo.type.join(', ') : 'N/A'}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={2}>
                                                    <FormControl fullWidth size="small">
                                                        <Selects
                                                            options={candidate_educational_upload_status}
                                                            styles={colourStyles}
                                                            value={{ label: todo.status, value: todo.status }}

                                                            onChange={(e) => {
                                                                const updated = [...todoscheck];
                                                                const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].status = e.value;
                                                                    updated[idx].deadlinedate = "";
                                                                    updated[idx].reason = "";
                                                                    updated[idx].uploadedby = "";
                                                                    updated[idx].name = "";
                                                                    updated[idx].file = null;
                                                                    setTodoscheck(updated);
                                                                }
                                                            }}
                                                            isDisabled={readOnly}
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                {todo.status !== 'No Document' && todo.pagemode?.length > 0 && (
                                                    <Grid item xs={12} sm={2}>
                                                        <FormControl fullWidth size="small">
                                                            <Selects
                                                                options={todo.pagemode.map(mode => ({ label: mode, value: mode }))}
                                                                styles={colourStyles}
                                                                value={{ label: todo.pagemodeselected || 'Page Mode', value: todo.pagemodeselected || 'Page Mode' }}
                                                                onChange={(e) => {
                                                                    const updated = [...todoscheck];
                                                                    const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                    if (idx !== -1) {
                                                                        updated[idx].pagemodeselected = e.value;
                                                                        setTodoscheck(updated);
                                                                    }
                                                                }}
                                                                isDisabled={readOnly}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                )}

                                                {(todo.status !== 'Pending' && todo.status !== 'No Document') && !readOnly && todo?.pagemodeselected && (
                                                    <Grid item xs={12} sm={2}>
                                                        <Button
                                                            component="label"
                                                            variant="contained"
                                                            size="small"
                                                            fullWidth
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            Upload File
                                                            <input
                                                                type="file"
                                                                hidden
                                                                onChange={(e) => {
                                                                    const updated = [...todoscheck];
                                                                    const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                    if (idx !== -1) {
                                                                        handleCandidateUploadForIndex(e, idx)
                                                                    }
                                                                }}
                                                            />
                                                        </Button>
                                                    </Grid>
                                                )}

                                                {todo.status === 'Pending' && (
                                                    <Grid item xs={12} sm={2}>
                                                        <OutlinedInput
                                                            fullWidth
                                                            size="small"
                                                            type="date"
                                                            value={todo.deadlinedate || ''}
                                                            readOnly={readOnly}
                                                            onChange={(e) => {
                                                                const updated = [...todoscheck];
                                                                const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].deadlinedate = e.target.value;
                                                                    setTodoscheck(updated);
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                )}

                                                {todo.status === 'No Document' && (
                                                    <Grid item xs={12} sm={2}>
                                                        <OutlinedInput
                                                            fullWidth
                                                            size="small"
                                                            placeholder="Enter reason for no document"
                                                            value={todo.reason || ''}
                                                            readOnly={readOnly}
                                                            onChange={(e) => {
                                                                const updated = [...todoscheck];
                                                                const idx = updated.findIndex(todoss => todoss?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].reason = e.target.value;
                                                                    setTodoscheck(updated);
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                )}

                                                <Grid item xs={12} sm={2}>
                                                    <OutlinedInput
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Category"
                                                        value={todo.category || ''}
                                                        readOnly
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <OutlinedInput
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Sub Category"
                                                        value={todo.subcategory || ''}
                                                        readOnly
                                                    />
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </AccordionDetails>
            </Accordion>
        ))
    );
};

export default TodosAccordion;
