import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { isTechLevelAtLeast } from '../data/constants';
import './RulesMenu.css';
const RulesMenu = ({ shipDesign, onRuleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    // Calculate tech level restrictions dynamically
    const currentTechLevel = shipDesign.ship.tech_level;
    const canUseAntimatter = isTechLevelAtLeast(currentTechLevel, 'H');
    const canUseLongerJumps = isTechLevelAtLeast(currentTechLevel, 'G');
    const [rules, setRules] = useState([
        {
            id: 'spacecraft_design_srd',
            name: 'Spacecraft Design SRD',
            enabled: true,
            disabled: false
        },
        {
            id: 'high_guard_capital_ships',
            name: 'High Guard Capital Ship Design SRD',
            enabled: false,
            disabled: true // greyed out and can't be selected
        },
        {
            id: 'antimatter',
            name: 'Antimatter',
            enabled: false,
            disabled: !canUseAntimatter
        },
        {
            id: 'longer_jumps',
            name: 'Longer Jumps',
            enabled: false,
            disabled: !canUseLongerJumps
        }
    ]);
    // Update rules when tech level changes
    useEffect(() => {
        setRules(prevRules => prevRules.map(rule => {
            if (rule.id === 'antimatter') {
                return {
                    ...rule,
                    disabled: !canUseAntimatter,
                    enabled: rule.enabled && canUseAntimatter // Turn off if no longer available
                };
            }
            else if (rule.id === 'longer_jumps') {
                return {
                    ...rule,
                    disabled: !canUseLongerJumps,
                    enabled: rule.enabled && canUseLongerJumps // Turn off if no longer available
                };
            }
            return rule;
        }));
    }, [canUseAntimatter, canUseLongerJumps]);
    const toggleRule = (ruleId) => {
        const rule = rules.find(r => r.id === ruleId);
        if (!rule || rule.disabled)
            return;
        // Don't allow disabling the Spacecraft Design SRD (it's always selected)
        if (ruleId === 'spacecraft_design_srd')
            return;
        setRules(prevRules => prevRules.map(r => r.id === ruleId
            ? { ...r, enabled: !r.enabled }
            : r));
        if (onRuleChange) {
            onRuleChange(ruleId, !rule.enabled);
        }
    };
    const getStatusIcon = (rule) => {
        if (rule.disabled) {
            // Show special indicators for tech-level restricted rules
            if (rule.id === 'antimatter' && !canUseAntimatter) {
                return _jsx("span", { className: "rule-status disabled", title: `Requires Tech Level H (current: ${currentTechLevel})`, children: "\u2014" });
            }
            else if (rule.id === 'longer_jumps' && !canUseLongerJumps) {
                return _jsx("span", { className: "rule-status disabled", title: `Requires Tech Level G+ (current: ${currentTechLevel})`, children: "\u2014" });
            }
            return _jsx("span", { className: "rule-status disabled", children: "\u2014" });
        }
        return rule.enabled
            ? _jsx("span", { className: "rule-status enabled", children: "\u2713" })
            : _jsx("span", { className: "rule-status disabled", children: "\u2717" });
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
    return (_jsxs("div", { className: "rules-menu", ref: menuRef, children: [_jsx("button", { className: "rules-menu-button", onClick: () => setIsOpen(!isOpen), "aria-haspopup": "true", "aria-expanded": isOpen, children: "Rules" }), isOpen && (_jsx("div", { className: "rules-menu-dropdown", children: rules.map(rule => (_jsxs("button", { className: `rules-menu-item ${rule.disabled ? 'disabled' : ''} ${rule.enabled ? 'enabled' : ''}`, onClick: () => toggleRule(rule.id), disabled: rule.disabled, children: [_jsx("span", { className: "menu-item-text", children: rule.name }), getStatusIcon(rule)] }, rule.id))) }))] }));
};
export default RulesMenu;
