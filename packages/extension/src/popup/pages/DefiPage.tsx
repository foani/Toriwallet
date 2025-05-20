import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../hooks/useNetwork';
import { useDefi } from '../hooks/useDefi';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import Loading from '../components/common/Loading';
import { FiInfo, FiRefreshCw, FiChevronRight } from 'react-icons/fi';

/**
 * DeFi 페이지 컴포넌트
 * 
 * DeFi 기능을 제공하는 메인 페이지입니다. 유동성 풀, 파밍, 대출 등의 탭을 포함합니다.
 */
const DefiPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount, isWalletUnlocked } = useWallet();
  const { selectedNetwork } = useNetwork();
  const {
    pools,
    liquidityPositions,
    farmingPositions,
    lendingPools,
    lendingPositions,
    defiTransactions,
    isLoading,
    loadPools,
    loadLiquidityPositions,
    loadFarmingPositions,
    loadLendingPools,
    loadLendingPositions,
    loadTransactionHistory
  } = useDefi();
  
  // 로컬 상태
  const [activeTab, setActiveTab] = useState<
    'pools' | 'farming' | 'lending' | 'swap' | 'history'
  >('pools');
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    switch (activeTab) {
      case 'pools':
        loadPools(['SWAP'], ['ACTIVE']);
        loadLiquidityPositions();
        break;
      case 'farming':
        loadPools(['FARM'], ['ACTIVE']);
        loadFarmingPositions();
        break;
      case 'lending':
        loadLendingPools(['ACTIVE']);
        loadLendingPositions();
        break;
      case 'history':
        loadTransactionHistory();
        break;
      default:
        break;
    }
  };
  
  // 지갑이 잠겨있으면 메시지 표시
  if (!isWalletUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <FiInfo className="text-4xl text-gray-400 mb-2" />
        <p className="text-gray-600 text-center">
          DeFi 기능을 사용하려면 지갑 잠금을 해제하세요.
        </p>
      </div>
    );
  }
  
  // 계정이나 네트워크가 선택되지 않았으면 메시지 표시
  if (!selectedAccount || !selectedNetwork) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <FiInfo className="text-4xl text-gray-400 mb-2" />
        <p className="text-gray-600 text-center">
          DeFi 기능을 사용하려면 계정과 네트워크를 선택하세요.
        </p>
      </div>
    );
  }
  
  // 총 자산 가치 계산
  const calculateTotalAssets = () => {
    let totalUsd = 0;
    
    // 유동성 포지션 가치 합산
    liquidityPositions.forEach(position => {
      totalUsd += parseFloat(position.totalValueLockedUsd);
    });
    
    // 파밍 포지션 가치 합산
    farmingPositions.forEach(position => {
      totalUsd += parseFloat(position.totalValueLockedUsd);
    });
    
    // 대출 포지션 가치 합산 (공급만)
    lendingPositions.forEach(position => {
      if (position.isSupplying && position.supplyAmountUsd) {
        totalUsd += parseFloat(position.supplyAmountUsd);
      }
    });
    
    return totalUsd.toFixed(2);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">DeFi</h1>
        <p className="text-gray-600 text-sm">
          유동성 풀, 파밍, 대출 등의 DeFi 기능을 이용하세요.
        </p>
      </div>
      
      <div className="p-4 bg-blue-50 border-b">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-blue-700 font-medium">총 DeFi 자산</div>
          <button
            onClick={handleRefresh}
            className="p-1 text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
          >
            <FiRefreshCw />
          </button>
        </div>
        <div className="text-2xl font-semibold">${calculateTotalAssets()}</div>
        <div className="text-sm text-blue-700 mt-1">
          {liquidityPositions.length > 0 && (
            <span className="mr-4">유동성: ${liquidityPositions.reduce((sum, pos) => sum + parseFloat(pos.totalValueLockedUsd), 0).toFixed(2)}</span>
          )}
          {farmingPositions.length > 0 && (
            <span className="mr-4">파밍: ${farmingPositions.reduce((sum, pos) => sum + parseFloat(pos.totalValueLockedUsd), 0).toFixed(2)}</span>
          )}
          {lendingPositions.filter(p => p.isSupplying).length > 0 && (
            <span>대출: ${lendingPositions
              .filter(p => p.isSupplying && p.supplyAmountUsd)
              .reduce((sum, pos) => sum + parseFloat(pos.supplyAmountUsd || '0'), 0)
              .toFixed(2)}</span>
          )}
        </div>
      </div>
      
      <Tabs
        tabs={[
          { id: 'pools', label: '유동성 풀' },
          { id: 'farming', label: '파밍' },
          { id: 'lending', label: '대출' },
          { id: 'swap', label: '스왑' },
          { id: 'history', label: '기록' }
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loading />
          </div>
        ) : (
          <>
            {activeTab === 'pools' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">유동성 풀</h2>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate('/defi/pools')}
                  >
                    모든 풀 보기
                  </Button>
                </div>
                
                {/* 내 유동성 포지션 */}
                <h3 className="text-md font-medium mb-2">내 유동성 포지션</h3>
                {liquidityPositions.length > 0 ? (
                  <div>
                    {liquidityPositions.map(position => (
                      <div
                        key={position.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/pools/position/${position.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{position.pool.name}</div>
                          <div className="text-gray-600 text-sm">{position.pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">지분</div>
                            <div className="font-medium">{(position.share * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">가치</div>
                            <div className="font-medium">${parseFloat(position.totalValueLockedUsd).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        {position.tokens.map(token => (
                          <div key={token.address} className="text-sm text-gray-600">
                            {token.symbol}: {parseFloat(token.amount) > 1
                              ? parseFloat(token.amount).toFixed(2)
                              : parseFloat(token.amount).toFixed(6)}
                          </div>
                        ))}
                        
                        {position.pendingRewards && position.pendingRewards.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-gray-600 text-xs">보상</div>
                            {position.pendingRewards.map(reward => (
                              <div key={reward.token} className="text-sm">
                                {reward.token}: {parseFloat(reward.amount) > 1
                                  ? parseFloat(reward.amount).toFixed(2)
                                  : parseFloat(reward.amount).toFixed(6)}
                                {' '}(${parseFloat(reward.amountUsd).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        아직 유동성 풀에 참여하지 않았습니다.
                      </p>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate('/defi/pools')}
                        className="mt-2"
                      >
                        유동성 추가하기
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 추천 유동성 풀 */}
                <h3 className="text-md font-medium mb-2 mt-4">추천 유동성 풀</h3>
                {pools.filter(p => p.type === 'SWAP').length > 0 ? (
                  <div>
                    {pools.filter(p => p.type === 'SWAP').slice(0, 3).map(pool => (
                      <div
                        key={pool.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/pools/${pool.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{pool.name}</div>
                          <div className="text-gray-600 text-sm">{pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">TVL</div>
                            <div className="font-medium">${parseFloat(pool.tvlUsd).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APR</div>
                            <div className="font-medium">{(pool.apr * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APY</div>
                            <div className="font-medium">{(pool.apy * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        사용 가능한 유동성 풀이 없습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'farming' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">파밍</h2>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate('/defi/farming')}
                  >
                    모든 파밍 풀 보기
                  </Button>
                </div>
                
                {/* 내 파밍 포지션 */}
                <h3 className="text-md font-medium mb-2">내 파밍 포지션</h3>
                {farmingPositions.length > 0 ? (
                  <div>
                    {farmingPositions.map(position => (
                      <div
                        key={position.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/farming/position/${position.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{position.pool.name}</div>
                          <div className="text-gray-600 text-sm">{position.pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">스테이킹 금액</div>
                            <div className="font-medium">${parseFloat(position.stakedLpTokens.amountUsd).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APR</div>
                            <div className="font-medium">{(position.apr * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APY</div>
                            <div className="font-medium">{(position.apy * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        {position.pendingRewards && position.pendingRewards.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-gray-600 text-xs">보상</div>
                            {position.pendingRewards.map(reward => (
                              <div key={reward.token} className="text-sm">
                                {reward.token}: {parseFloat(reward.amount) > 1
                                  ? parseFloat(reward.amount).toFixed(2)
                                  : parseFloat(reward.amount).toFixed(6)}
                                {' '}(${parseFloat(reward.amountUsd).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        아직 파밍에 참여하지 않았습니다.
                      </p>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate('/defi/farming')}
                        className="mt-2"
                      >
                        파밍 시작하기
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 추천 파밍 풀 */}
                <h3 className="text-md font-medium mb-2 mt-4">추천 파밍 풀</h3>
                {pools.filter(p => p.type === 'FARM').length > 0 ? (
                  <div>
                    {pools.filter(p => p.type === 'FARM').slice(0, 3).map(pool => (
                      <div
                        key={pool.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/farming/${pool.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{pool.name}</div>
                          <div className="text-gray-600 text-sm">{pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">TVL</div>
                            <div className="font-medium">${parseFloat(pool.tvlUsd).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APR</div>
                            <div className="font-medium">{(pool.apr * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">APY</div>
                            <div className="font-medium">{(pool.apy * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        {pool.rewardTokens && pool.rewardTokens.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            보상: {pool.rewardTokens.map(t => t.symbol).join(', ')}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        사용 가능한 파밍 풀이 없습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'lending' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">대출</h2>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate('/defi/lending')}
                  >
                    모든 대출 풀 보기
                  </Button>
                </div>
                
                {/* 내 대출 포지션 */}
                <h3 className="text-md font-medium mb-2">내 대출 포지션</h3>
                {lendingPositions.length > 0 ? (
                  <div>
                    {lendingPositions.map(position => (
                      <div
                        key={position.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/lending/position/${position.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{position.pool.name}</div>
                          <div className="text-gray-600 text-sm">{position.pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {position.isSupplying && (
                            <div>
                              <div className="text-gray-600 text-xs">공급량</div>
                              <div className="font-medium text-green-600">
                                {parseFloat(position.supplyAmount || '0') > 1
                                  ? parseFloat(position.supplyAmount || '0').toFixed(2)
                                  : parseFloat(position.supplyAmount || '0').toFixed(6)}
                                {' '}{position.pool.token.symbol}
                              </div>
                              <div className="text-xs text-gray-600">
                                ${parseFloat(position.supplyAmountUsd || '0').toFixed(2)}
                              </div>
                            </div>
                          )}
                          
                          {position.isBorrowing && (
                            <div>
                              <div className="text-gray-600 text-xs">대출량</div>
                              <div className="font-medium text-red-600">
                                {parseFloat(position.borrowAmount || '0') > 1
                                  ? parseFloat(position.borrowAmount || '0').toFixed(2)
                                  : parseFloat(position.borrowAmount || '0').toFixed(6)}
                                {' '}{position.pool.token.symbol}
                              </div>
                              <div className="text-xs text-gray-600">
                                ${parseFloat(position.borrowAmountUsd || '0').toFixed(2)}
                              </div>
                            </div>
                          )}
                          
                          {position.healthFactor !== undefined && (
                            <div>
                              <div className="text-gray-600 text-xs">건전성 지수</div>
                              <div className={`font-medium ${
                                position.healthFactor > 1.5 ? 'text-green-600' :
                                position.healthFactor > 1.2 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {position.healthFactor.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-gray-600 text-xs">공급 APY</div>
                            <div className="text-sm">{(position.pool.supplyApy * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">대출 APY</div>
                            <div className="text-sm">{(position.pool.borrowApy * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        아직 대출 포지션이 없습니다.
                      </p>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate('/defi/lending')}
                        className="mt-2"
                      >
                        대출 시작하기
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 추천 대출 풀 */}
                <h3 className="text-md font-medium mb-2 mt-4">추천 대출 풀</h3>
                {lendingPools.length > 0 ? (
                  <div>
                    {lendingPools.slice(0, 3).map(pool => (
                      <div
                        key={pool.id}
                        className="bg-white rounded-lg shadow mb-3 p-4 cursor-pointer"
                        onClick={() => navigate(`/defi/lending/${pool.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{pool.name}</div>
                          <div className="text-gray-600 text-sm">{pool.platform}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">총 공급량</div>
                            <div className="font-medium">${parseFloat(pool.totalSupplyUsd).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">총 대출량</div>
                            <div className="font-medium">${parseFloat(pool.totalBorrowUsd).toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <div className="text-gray-600 text-xs">공급 APY</div>
                            <div className="font-medium">{(pool.supplyApy * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">대출 APY</div>
                            <div className="font-medium">{(pool.borrowApy * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-2">
                          <FiChevronRight className="text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        사용 가능한 대출 풀이 없습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'swap' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">토큰 스왑</h2>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      토큰을 교환하려면 스왑 페이지로 이동하세요.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/defi/swap')}
                    >
                      스왑 페이지로 이동
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">트랜잭션 내역</h2>
                  <button
                    onClick={handleRefresh}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FiRefreshCw />
                  </button>
                </div>
                
                {defiTransactions.length > 0 ? (
                  <div>
                    {defiTransactions.map(tx => (
                      <div
                        key={tx.id}
                        className="bg-white rounded-lg shadow mb-3 p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-medium">
                              {tx.type === 'ADD_LIQUIDITY' ? '유동성 추가' :
                              tx.type === 'REMOVE_LIQUIDITY' ? '유동성 제거' :
                              tx.type === 'STAKE_LP_TOKEN' ? 'LP 토큰 스테이킹' :
                              tx.type === 'UNSTAKE_LP_TOKEN' ? 'LP 토큰 언스테이킹' :
                              tx.type === 'HARVEST_REWARDS' ? '보상 수확' :
                              tx.type === 'SUPPLY' ? '자산 공급' :
                              tx.type === 'WITHDRAW' ? '자산 인출' :
                              tx.type === 'BORROW' ? '자산 대출' :
                              tx.type === 'REPAY' ? '대출 상환' : tx.type}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tx.status === 'COMPLETED' ? '완료' :
                             tx.status === 'PENDING' ? '대기 중' : '실패'}
                          </div>
                        </div>
                        
                        <div className="text-gray-600 text-sm mb-2">
                          {tx.poolName || tx.poolId}
                          {tx.platformName && ` (${tx.platformName})`}
                        </div>
                        
                        {tx.tokens && tx.tokens.length > 0 && (
                          <div className="mb-2">
                            {tx.tokens.map((token, index) => (
                              <div key={index} className="text-sm">
                                {tx.type === 'SWAP' && index === 0 ? '보냄: ' :
                                 tx.type === 'SWAP' && index === 1 ? '받음: ' : ''}
                                {parseFloat(token.amount) > 1
                                  ? parseFloat(token.amount).toFixed(2)
                                  : parseFloat(token.amount).toFixed(6)}
                                {' '}{token.symbol}
                                {' '}(${parseFloat(token.amountUsd).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {tx.transactionHash && (
                          <div
                            className="text-blue-600 text-sm flex items-center justify-end cursor-pointer"
                            onClick={() => {
                              if (selectedNetwork.blockExplorerUrl && tx.transactionHash) {
                                window.open(
                                  `${selectedNetwork.blockExplorerUrl}/tx/${tx.transactionHash}`,
                                  '_blank'
                                );
                              }
                            }}
                          >
                            익스플로러에서 보기 <FiChevronRight className="ml-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <FiInfo className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        아직 DeFi 트랜잭션 내역이 없습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DefiPage;
