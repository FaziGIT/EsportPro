<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg mb-4">Two-Factor Authentication</h3>
    
    <!-- 2FA Status -->
    <div class="mb-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">{{ is2faEnabled ? 'Enabled' : 'Disabled' }}</p>
          <p class="text-sm text-gray-600">
            {{ is2faEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security to your account' }}
          </p>
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 rounded-full mr-2" :class="is2faEnabled ? 'bg-green-500' : 'bg-red-500'"></span>
          <span class="text-sm font-medium">{{ is2faEnabled ? 'Active' : 'Inactive' }}</span>
        </div>
      </div>
    </div>

    <!-- Enable 2FA -->
    <div v-if="!is2faEnabled && !setupMode" class="space-y-4">
      <p class="text-sm text-gray-600">
        Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device.
      </p>
      <button
        @click="enableTwoFa"
        :disabled="loading"
        class="bg-[#5C4741] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a3832] transition-colors"
      >
        {{ loading ? 'Setting up...' : 'Enable 2FA' }}
      </button>
    </div>

    <!-- 2FA Setup -->
    <div v-if="setupMode" class="space-y-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">Step 1: Install an authenticator app</h4>
        <p class="text-sm text-gray-600 mb-2">
          Download and install an authenticator app like Microsoft Authenticator, Google Authenticator, or Authy.
        </p>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">Step 2: Scan the QR code</h4>
        <p class="text-sm text-gray-600 mb-4">
          Scan this QR code with your authenticator app:
        </p>
        
        <!-- QR Code -->
        <div class="flex justify-center mb-4">
          <img :src="qrCodeUrl" alt="QR Code" class="border rounded-lg" />
        </div>
        
        <!-- Manual entry -->
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-2">
            Can't scan? Enter this code manually:
          </p>
          <code class="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{{ secret }}</code>
        </div>
      </div>

      <!-- Recovery codes -->
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">Recovery codes</h4>
        <p class="text-sm text-gray-600 mb-3">
          Save these recovery codes in a secure place. You can use them to access your account if you lose access to your authenticator app.
        </p>
        <div class="grid grid-cols-2 gap-2 mb-3">
          <code 
            v-for="code in recoveryCodes" 
            :key="code"
            class="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-center"
          >
            {{ code }}
          </code>
        </div>
        <button
          @click="copyRecoveryCodes"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Copy all codes
        </button>
      </div>

      <!-- Verification -->
      <div class="bg-green-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">Step 3: Verify setup</h4>
        <p class="text-sm text-gray-600 mb-3">
          Enter the 6-digit code from your authenticator app to complete setup:
        </p>
        
        <form @submit.prevent="confirmSetup" class="space-y-3">
          <div>
            <input
              type="text"
              v-model="verificationCode"
              placeholder="123456"
              maxlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg tracking-wider"
              :class="{
                'border-red-500': verificationError,
              }"
            />
            <p v-if="verificationError" class="text-sm text-red-500 mt-1">
              {{ verificationError }}
            </p>
          </div>
          
          <div class="flex gap-2">
            <button
              type="button"
              @click="cancelSetup"
              class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || verificationCode.length !== 6"
              class="flex-1 bg-[#5C4741] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a3832] transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Verifying...' : 'Verify & Enable' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2FA Management -->
    <div v-if="is2faEnabled && !setupMode" class="space-y-4">
      <div class="bg-green-50 p-4 rounded-lg">
        <p class="text-sm text-gray-600 mb-2">
          Two-factor authentication is active on your account.
        </p>
        <p class="text-sm text-gray-600">
          Recovery codes remaining: <span class="font-medium">{{ recoveryCodesCount }}</span>
        </p>
      </div>

      <div class="flex gap-2">
        <button
          @click="showDisableForm = !showDisableForm"
          class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Disable 2FA
        </button>
      </div>

      <!-- Disable 2FA Form -->
      <div v-if="showDisableForm" class="bg-red-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2 text-red-800">Disable Two-Factor Authentication</h4>
        <p class="text-sm text-red-700 mb-3">
          Enter a code from your authenticator app to disable 2FA:
        </p>
        
        <form @submit.prevent="disableTwoFa" class="space-y-3">
          <div>
            <input
              type="text"
              v-model="disableCode"
              placeholder="123456"
              maxlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg tracking-wider"
              :class="{
                'border-red-500': disableError,
              }"
            />
            <p v-if="disableError" class="text-sm text-red-500 mt-1">
              {{ disableError }}
            </p>
          </div>
          
          <div class="flex gap-2">
            <button
              type="button"
              @click="showDisableForm = false"
              class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || disableCode.length !== 6"
              class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Disabling...' : 'Disable 2FA' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCsrfToken } from '~/utils'

const is2faEnabled = ref(false)
const setupMode = ref(false)
const loading = ref(false)
const recoveryCodesCount = ref(0)

const secret = ref('')
const qrCodeUrl = ref('')
const recoveryCodes = ref<string[]>([])
const verificationCode = ref('')
const verificationError = ref('')

const showDisableForm = ref(false)
const disableCode = ref('')
const disableError = ref('')

onMounted(() => {
  fetchTwoFaStatus()
})

const fetchTwoFaStatus = async () => {
  try {
    const token = getCsrfToken()
    const response = await fetch('/api/2fa/status', {
      headers: {
        'X-CSRF-TOKEN': token || '',
      }
    })
    const data = await response.json()
    is2faEnabled.value = data.is2faEnabled
    recoveryCodesCount.value = data.recoveryCodesCount
  } catch (error) {
    // Silent error handling
  }
}

const enableTwoFa = async () => {
  loading.value = true
  try {
    const token = getCsrfToken()
    const response = await fetch('/api/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || ''
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      secret.value = data.secret
      qrCodeUrl.value = data.qrCodeUrl
      recoveryCodes.value = data.recoveryCodes
      setupMode.value = true
    }
  } catch (error) {
    // Silent error handling
  } finally {
    loading.value = false
  }
}

const confirmSetup = async () => {
  loading.value = true
  verificationError.value = ''
  
  try {
    const token = getCsrfToken()
    const response = await fetch('/api/2fa/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || ''
      },
      body: JSON.stringify({ code: verificationCode.value })
    })
    
    if (response.ok) {
      is2faEnabled.value = true
      setupMode.value = false
      verificationCode.value = ''
      await fetchTwoFaStatus()
    } else {
      const errorData = await response.json()
      verificationError.value = errorData.message || 'Invalid verification code'
    }
  } catch (error) {
    verificationError.value = 'Error verifying code'
  } finally {
    loading.value = false
  }
}

const disableTwoFa = async () => {
  loading.value = true
  disableError.value = ''
  
  try {
    const token = getCsrfToken()
    const response = await fetch('/api/2fa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token || ''
      },
      body: JSON.stringify({ code: disableCode.value })
    })
    
    if (response.ok) {
      is2faEnabled.value = false
      showDisableForm.value = false
      disableCode.value = ''
      await fetchTwoFaStatus()
    } else {
      const errorData = await response.json()
      disableError.value = errorData.message || 'Invalid verification code'
    }
  } catch (error) {
    disableError.value = 'Error disabling 2FA'
  } finally {
    loading.value = false
  }
}

const cancelSetup = () => {
  setupMode.value = false
  verificationCode.value = ''
  verificationError.value = ''
}

const copyRecoveryCodes = () => {
  const codes = recoveryCodes.value.join('\n')
  navigator.clipboard.writeText(codes)
}
</script> 