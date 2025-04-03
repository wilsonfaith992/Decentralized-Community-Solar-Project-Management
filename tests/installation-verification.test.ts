import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockContractState = {
  admin: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  installations: new Map(),
  nextInstallationId: 1,
}

const mockTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockBlockHeight = 100

// Mock contract functions
function registerInstallation(capacity, location, sender = mockTxSender) {
  const installationId = mockContractState.nextInstallationId
  
  mockContractState.installations.set(installationId, {
    owner: sender,
    capacity,
    location,
    verified: false,
    installationDate: mockBlockHeight,
  })
  
  mockContractState.nextInstallationId += 1
  return { ok: installationId }
}

function verifyInstallation(installationId, sender = mockTxSender) {
  if (sender !== mockContractState.admin) {
    return { err: 403 }
  }
  
  if (!mockContractState.installations.has(installationId)) {
    return { err: 404 }
  }
  
  const installation = mockContractState.installations.get(installationId)
  installation.verified = true
  mockContractState.installations.set(installationId, installation)
  
  return { ok: true }
}

function getInstallation(installationId) {
  if (!mockContractState.installations.has(installationId)) {
    return null
  }
  return mockContractState.installations.get(installationId)
}

function transferAdmin(newAdmin, sender = mockTxSender) {
  if (sender !== mockContractState.admin) {
    return { err: 403 }
  }
  
  mockContractState.admin = newAdmin
  return { ok: true }
}

// Tests
describe("Installation Verification Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    mockContractState.installations = new Map()
    mockContractState.nextInstallationId = 1
    mockContractState.admin = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  })
  
  it("should register a new installation", () => {
    const result = registerInstallation(5000, "New York")
    expect(result.ok).toBe(1)
    
    const installation = getInstallation(1)
    expect(installation).not.toBeNull()
    expect(installation.capacity).toBe(5000)
    expect(installation.location).toBe("New York")
    expect(installation.verified).toBe(false)
  })
  
  it("should verify an installation", () => {
    registerInstallation(5000, "New York")
    const result = verifyInstallation(1)
    expect(result.ok).toBe(true)
    
    const installation = getInstallation(1)
    expect(installation.verified).toBe(true)
  })
  
  it("should fail to verify if not admin", () => {
    registerInstallation(5000, "New York")
    const result = verifyInstallation(1, "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
    expect(result.err).toBe(403)
    
    const installation = getInstallation(1)
    expect(installation.verified).toBe(false)
  })
  
  it("should transfer admin rights", () => {
    const newAdmin = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = transferAdmin(newAdmin)
    expect(result.ok).toBe(true)
    expect(mockContractState.admin).toBe(newAdmin)
  })
})

