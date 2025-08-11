import React, { useState, useRef, useEffect } from 'react';
import { isTechLevelAtLeast } from '../data/constants';
import type { ShipDesign } from '../types/ship';
import './RulesMenu.css';

interface RuleItem {
  id: string;
  name: string;
  enabled: boolean;
  disabled: boolean;
}

interface RulesMenuProps {
  shipDesign: ShipDesign;
  onRuleChange?: (ruleId: string, enabled: boolean) => void;
}

const RulesMenu: React.FC<RulesMenuProps> = ({ shipDesign, onRuleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Calculate tech level restrictions dynamically
  const currentTechLevel = shipDesign.ship.tech_level;
  const canUseAntimatter = isTechLevelAtLeast(currentTechLevel, 'H');
  const canUseLongerJumps = isTechLevelAtLeast(currentTechLevel, 'G');
  
  const [rules, setRules] = useState<RuleItem[]>([
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
      } else if (rule.id === 'longer_jumps') {
        return { 
          ...rule, 
          disabled: !canUseLongerJumps,
          enabled: rule.enabled && canUseLongerJumps // Turn off if no longer available
        };
      }
      return rule;
    }));
  }, [canUseAntimatter, canUseLongerJumps]);

  const toggleRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || rule.disabled) return;

    // Don't allow disabling the Spacecraft Design SRD (it's always selected)
    if (ruleId === 'spacecraft_design_srd') return;

    setRules(prevRules => 
      prevRules.map(r => 
        r.id === ruleId 
          ? { ...r, enabled: !r.enabled }
          : r
      )
    );

    if (onRuleChange) {
      onRuleChange(ruleId, !rule.enabled);
    }
  };

  const getStatusIcon = (rule: RuleItem) => {
    if (rule.disabled) {
      // Show special indicators for tech-level restricted rules
      if (rule.id === 'antimatter' && !canUseAntimatter) {
        return <span className="rule-status disabled" title={`Requires Tech Level H (current: ${currentTechLevel})`}>—</span>;
      } else if (rule.id === 'longer_jumps' && !canUseLongerJumps) {
        return <span className="rule-status disabled" title={`Requires Tech Level G+ (current: ${currentTechLevel})`}>—</span>;
      }
      return <span className="rule-status disabled">—</span>;
    }
    return rule.enabled 
      ? <span className="rule-status enabled">✓</span>
      : <span className="rule-status disabled">✗</span>;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="rules-menu" ref={menuRef}>
      <button 
        className="rules-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Rules
      </button>
      
      {isOpen && (
        <div className="rules-menu-dropdown">
          {rules.map(rule => (
            <button 
              key={rule.id}
              className={`rules-menu-item ${rule.disabled ? 'disabled' : ''} ${rule.enabled ? 'enabled' : ''}`}
              onClick={() => toggleRule(rule.id)}
              disabled={rule.disabled}
            >
              <span className="menu-item-text">{rule.name}</span>
              {getStatusIcon(rule)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RulesMenu;