import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { databaseService } from '../services/database';
import './FileMenu.css';
const FileMenu = ({ shipDesign, onPrint, onSave, onSaveAs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
    const [saveAsName, setSaveAsName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const menuRef = useRef(null);
    // Handle Save functionality
    const handleSave = async () => {
        if (onSave) {
            onSave();
        }
        else {
            // Fallback implementation
            if (!shipDesign.ship.name.trim()) {
                setSaveMessage('Please enter a ship name before saving.');
                setTimeout(() => setSaveMessage(null), 3000);
                return;
            }
            try {
                setSaving(true);
                setSaveMessage(null);
                await databaseService.initialize();
                await databaseService.saveShip(shipDesign);
                setSaveMessage('Ship design saved successfully!');
                setTimeout(() => setSaveMessage(null), 3000);
            }
            catch (error) {
                console.error('Error saving ship:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
                setSaveMessage(errorMessage);
                setTimeout(() => setSaveMessage(null), 5000);
            }
            finally {
                setSaving(false);
            }
        }
        setIsOpen(false);
    };
    // Handle Save As functionality
    const handleSaveAs = () => {
        setSaveAsName(shipDesign.ship.name);
        setShowSaveAsDialog(true);
        setIsOpen(false);
    };
    const handleSaveAsConfirm = async () => {
        if (!saveAsName.trim()) {
            setSaveMessage('Please enter a ship name.');
            setTimeout(() => setSaveMessage(null), 3000);
            return;
        }
        if (onSaveAs) {
            onSaveAs(saveAsName);
        }
        else {
            // Fallback implementation
            try {
                setSaving(true);
                setSaveMessage(null);
                const modifiedShipDesign = {
                    ...shipDesign,
                    ship: { ...shipDesign.ship, name: saveAsName }
                };
                await databaseService.initialize();
                await databaseService.saveShip(modifiedShipDesign);
                setSaveMessage('Ship design saved successfully!');
                setTimeout(() => setSaveMessage(null), 3000);
            }
            catch (error) {
                console.error('Error saving ship:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to save ship design. Please try again.';
                setSaveMessage(errorMessage);
                setTimeout(() => setSaveMessage(null), 5000);
            }
            finally {
                setSaving(false);
            }
        }
        setShowSaveAsDialog(false);
        setSaveAsName('');
    };
    // Handle Print functionality
    const handlePrint = () => {
        onPrint();
        setIsOpen(false);
    };
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    // Close menu on escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "file-menu", ref: menuRef, children: [_jsx("button", { className: "file-menu-button", onClick: () => setIsOpen(!isOpen), "aria-haspopup": "true", "aria-expanded": isOpen, children: "File" }), isOpen && (_jsxs("div", { className: "file-menu-dropdown", children: [_jsxs("button", { className: "file-menu-item", onClick: handleSave, disabled: saving, children: [_jsx("span", { className: "menu-item-text", children: "Save" }), _jsx("span", { className: "menu-item-shortcut", children: "Ctrl+S" })] }), _jsxs("button", { className: "file-menu-item", onClick: handleSaveAs, disabled: saving, children: [_jsx("span", { className: "menu-item-text", children: "Save As..." }), _jsx("span", { className: "menu-item-shortcut", children: "Ctrl+Shift+S" })] }), _jsx("div", { className: "file-menu-separator" }), _jsxs("button", { className: "file-menu-item", onClick: handlePrint, children: [_jsx("span", { className: "menu-item-text", children: "Print" }), _jsx("span", { className: "menu-item-shortcut", children: "Ctrl+P" })] })] }))] }), showSaveAsDialog && (_jsx("div", { className: "file-menu-dialog-overlay", children: _jsxs("div", { className: "file-menu-dialog", children: [_jsx("h3", { children: "Save Ship As" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "saveAsName", children: "Ship Name:" }), _jsx("input", { id: "saveAsName", type: "text", value: saveAsName, onChange: (e) => setSaveAsName(e.target.value), placeholder: "Enter ship name", maxLength: 32, autoFocus: true })] }), _jsxs("div", { className: "file-menu-dialog-actions", children: [_jsx("button", { className: "save-btn", onClick: handleSaveAsConfirm, disabled: saving || !saveAsName.trim(), children: saving ? 'Saving...' : 'Save' }), _jsx("button", { className: "cancel-btn", onClick: () => {
                                        setShowSaveAsDialog(false);
                                        setSaveAsName('');
                                    }, disabled: saving, children: "Cancel" })] })] }) })), saveMessage && (_jsx("div", { className: `file-menu-message ${saveMessage.includes('successfully') ? 'success' : 'error'}`, children: saveMessage }))] }));
};
export default FileMenu;
