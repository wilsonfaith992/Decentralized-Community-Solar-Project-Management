import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockContractState = {
  admin: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  participants: new Map(),
}

const mockTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockBlockHeight = 100

// Mock contract functions
function joinCommunity(investmentAmount, installationId, sender = mockTxSender) {
  if (investmentAmount <= 0) {
    return { err: 400 }
  }
  
  mockContractState.participants.set(sender, {
    investmentAmount,
    joinDate: mockBlockHeight,
    active: true,
    installationId,
  })
  
  return { ok: true }
}

function updateInvestment(newAmount, sender = mockTxSender) {
  if (!mockContractState.participants.has(sender)) {
    return { err: 404 }
  }
  
  const participant = mockContractState.participants.get(sender)
  participant.investmentAmount = newAmount
  mockContractState.participants.set(sender, participant)
  
  return { ok: true }
}

function leaveCommunity(sender = mockTxSender) {
  if (!mockContractState.participants.has(sender)) {
    return { err: 404 }
  }
  
  const participant = mockContractState.participants.get(sender)
  participant.active = false
  mockContractState.participants.set(sender, participant)
  
  return { ok: true }
}

function getParticipant(participantId) {
  if (!mockContractState.participants.has(participantId)) {
    return null
  }
  return mockContractState.participants.get(participantId)
}

function removeParticipant(participantId, sender = mockTxSender) {
  if (sender !== mockContractState.admin) {
    return { err: 403 }
  }
  
  if (!mockContractState.participants.has(participantId)) {
    return { err: 404 }
  }
  
  const participant = mockContractState.participants.get(participantId)
  participant.active = false
  mockContractState.participants.set(participantId, participant)
  
  return { ok: true }
}

// Tests
describe("Participant Management Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    mockContractState.participants = new Map()
    mockContractState.admin = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  })
  
  it("should allow a user to join the community", () => {
    const result = joinCommunity(1000, 1)
    expect(result.ok).toBe(true)
    
    const participant = getParticipant(mockTxSender)
    expect(participant).not.toBeNull()
    expect(participant.investmentAmount).toBe(1000)
    expect(participant.installationId).toBe(1)
    expect(participant.active).toBe(true)
  })
  
  it("should reject joining with zero investment", () => {
    const result = joinCommunity(0, 1)
    expect(result.err).toBe(400)
  })
  
  it("should allow updating investment amount", () => {
    joinCommunity(1000, 1)
    const result = updateInvestment(2000)
    expect(result.ok).toBe(true)
    
    const participant = getParticipant(mockTxSender)
    expect(participant.investmentAmount).toBe(2000)
  })
  
  it("should allow a participant to leave", () => {
    joinCommunity(1000, 1)
    const result = leaveCommunity()
    expect(result.ok).toBe(true)
    
    const participant = getParticipant(mockTxSender)
    expect(participant.active).toBe(false)
  })
  
  it("should allow admin to remove a participant", () => {
    const participantId = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    joinCommunity(1000, 1, participantId)
    const result = removeParticipant(participantId)
    expect(result.ok).toBe(true)
    
    const participant = getParticipant(participantId)
    expect(participant.active).toBe(false)
  })
})

