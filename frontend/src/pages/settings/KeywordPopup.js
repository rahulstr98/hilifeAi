// KeywordPopup.js
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const KeywordPopup = ({ open, onClose, title, keywords }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {`${title || ''} Keyword Reference`}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.No</TableCell>
                            <TableCell>Keyword</TableCell>
                            <TableCell>Instruction</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {keywords.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.keyword}</TableCell>
                                <TableCell>{item.instruction}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};

export default KeywordPopup;
