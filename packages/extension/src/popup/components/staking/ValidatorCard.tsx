import React from 'react';
import { Validator } from '../../../core/types';
import Card from '../common/Card';
import Button from '../common/Button';

interface ValidatorCardProps {
  validator: Validator;
  onSelect: (validator: Validator) => void;
  onStake?: (validator: Validator) => void;
  isSelected?: boolean;
}

/**
 * ValidatorCard component
 * 
 * Displays information about a validator and provides options to select or stake
 */
const ValidatorCard: React.FC<ValidatorCardProps> = ({
  validator,
  onSelect,
  onStake,
  isSelected = false
}) => {
  // Calculate voting power percentage (if totalVotingPower is available)
  const votingPowerPercentage = validator.votingPowerPercentage
    ? validator.votingPowerPercentage
    : validator.votingPower && validator.totalVotingPower
      ? (Number(validator.votingPower) / Number(validator.totalVotingPower)) * 100
      : null;
  
  // Format commission as percentage
  const commission = validator.commission
    ? `${(Number(validator.commission) * 100).toFixed(2)}%`
    : 'N/A';
  
  // Format uptime as percentage
  const uptime = validator.uptime
    ? `${(Number(validator.uptime) * 100).toFixed(2)}%`
    : 'N/A';
  
  return (
    <Card 
      className={`mb-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(validator)}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          {validator.image && (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={validator.image} 
                alt={validator.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-lg">{validator.name || 'Unknown Validator'}</h3>
            <div className="text-gray-600 text-sm truncate">{validator.address}</div>
          </div>
          {validator.status && (
            <div className={`px-2 py-1 rounded-full text-xs ${
              validator.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              validator.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
              validator.status === 'JAILED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {validator.status}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-gray-600 text-xs">Voting Power</div>
            <div className="font-medium">
              {votingPowerPercentage !== null
                ? `${votingPowerPercentage.toFixed(2)}%`
                : validator.votingPower || 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">Commission</div>
            <div className="font-medium">{commission}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">Uptime</div>
            <div className="font-medium">{uptime}</div>
          </div>
        </div>
        
        {validator.description && (
          <div className="mb-3">
            <div className="text-gray-600 text-sm line-clamp-2">{validator.description}</div>
          </div>
        )}
        
        {onStake && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onStake(validator);
              }}
            >
              Stake
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ValidatorCard;
