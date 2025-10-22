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


const TodosAccordionEdit = ({
    fromEmployee=false,
    uploadedCandidateFilesEdit,
    setUploadedCandidateFilesEdit,
    loading,
    handleCandidateUploadForIndex,
    handleCopyTemplate,
    colourStyles,
    candidate_educational_upload_status,
    renderFilePreviewMulterUploaded,
}) => {
    // Group todos by category and subcategory
    const grouped = uploadedCandidateFilesEdit?.reduce((acc, todo) => {
        const cat = todo.category || 'Uncategorized';
        const subcat = todo.subcategory || 'Unspecified';
        acc[cat] = acc[cat] || {};
        acc[cat][subcat] = acc[cat][subcat] || [];
        acc[cat][subcat].push(todo);
        return acc;
    }, {});

    return (
        Object.entries(grouped).map(([category, subcats]) => (
            <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {Object.entries(subcats).map(([subcategory, items]) => (
                        <Accordion key={subcategory} sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{subcategory}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {items.map((todo, index) => (
                                    <Accordion key={todo.indexid || index} sx={{ mb: 1 }}>
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
                                                                    background: todo.uploadedby === 'candidiate' ? 'green' :
                                                                        todo.uploadedby === 'employee' ? 'orange' : 'brown',
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

                                                    {todo.linkname && todo.status === 'Pending' && !fromEmployee &&(
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            onClick={() => handleCopyTemplate({ ...todo, documenttype: todo?.candidatefilename }, "Others")}
                                                            disabled={loading}
                                                        >
                                                            {loading ? <CircularProgress size={16} /> : 'Email Template'}
                                                        </Button>
                                                    )}

                                                    {todo.name && todo.status === 'Uploaded' && todo?.filename && !todo.file &&(
                                                        <>
                                                            <IconButton onClick={() => renderFilePreviewMulterUploaded(todo)} size="small" color="primary">
                                                                <VisibilityOutlinedIcon />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                     {todo.file && (
                                                                                                                           <IconButton
                                                                                                                             onClick={() => window.open(URL.createObjectURL(todo.file), '_blank')}
                                                                                                                             size="small"
                                                                                                                             sx={{ ml: 1 }}
                                                                                                                           >
                                                                                                                             <VisibilityOutlinedIcon sx={{ color: '#0B7CED' }} />
                                                                                                                           </IconButton>
                                                                                                                         )}
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                                        <strong>Page Type:</strong> {todo.pagetype || 'N/A'} |&nbsp;
                                                        <strong>Max Size:</strong> {todo.size || '0'} {todo.sizeunit || ''} |&nbsp;
                                                        <strong>Accepted Types:</strong> {Array.isArray(todo.type) ? todo.type.join(', ') : 'N/A'}
                                                        <br />
                                                        <strong>Verification Status:</strong>{' '}
                                                        {(todo?.verificationdetails?.length === 0 || !todo?.verificationdetails)
                                                            ? "Not Verified"
                                                            : (todo?.verificationdetails?.[todo.verificationdetails.length - 1]?.verified)
                                                                ? "Verified"
                                                                : `Rejected - ${todo?.verificationdetails?.[todo.verificationdetails.length - 1]?.reason || ''}`}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={2}>
                                                    <FormControl fullWidth size="small">
                                                        <Selects
                                                            options={fromEmployee ? candidate_educational_upload_status :candidate_educational_upload_status?.filter(data => data?.value !== "Uploaded")}
                                                            styles={colourStyles}
                                                            value={{ label: todo.status, value: todo.status }}
                                                            onChange={(e) => {
                                                                const updated = [...uploadedCandidateFilesEdit];
                                                                const idx = updated.findIndex(t => t?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].status = e.value;
                                                                    updated[idx].deadlinedate = "";
                                                                    updated[idx].reason = "";
                                                                    updated[idx].uploadedby = "";
                                                                    updated[idx].name = "";
                                                                    updated[idx].file = null;
                                                                    setUploadedCandidateFilesEdit(updated);
                                                                }
                                                            }}
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
                                                                    const updated = [...uploadedCandidateFilesEdit];
                                                                    const idx = updated.findIndex(t => t?.indexid === todo?.indexid);
                                                                    if (idx !== -1) {
                                                                        updated[idx].pagemodeselected = e.value;
                                                                        setUploadedCandidateFilesEdit(updated);
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                )}
   {(todo.status !== 'Pending' && todo.status !== 'No Document') && todo?.pagemodeselected && (
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
                                                                    const updated = [...uploadedCandidateFilesEdit];
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
                                                            onChange={(e) => {
                                                                const updated = [...uploadedCandidateFilesEdit];
                                                                const idx = updated.findIndex(t => t?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].deadlinedate = e.target.value;
                                                                    setUploadedCandidateFilesEdit(updated);
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
                                                            onChange={(e) => {
                                                                const updated = [...uploadedCandidateFilesEdit];
                                                                const idx = updated.findIndex(t => t?.indexid === todo?.indexid);
                                                                if (idx !== -1) {
                                                                    updated[idx].reason = e.target.value;
                                                                    setUploadedCandidateFilesEdit(updated);
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

export default TodosAccordionEdit;
