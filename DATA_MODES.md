# Data Modes Configuration

The application supports three data modes for development, debugging, and production:

## Modes

### 1. Production (default)
- **Mode**: `production`
- **Description**: Uses real data from the API
- **Requires**: Wallet connection
- **Usage**: Set `NEXT_PUBLIC_DATA_MODE=production` or leave unset

### 2. Observation
- **Mode**: `observation`
- **Description**: Uses real data from the API, but for a specific wallet address
- **Requires**: `NEXT_PUBLIC_OBSERVATION_WALLET` environment variable
- **Usage**: 
  ```env
  NEXT_PUBLIC_DATA_MODE=observation
  NEXT_PUBLIC_OBSERVATION_WALLET=0x1234567890123456789012345678901234567890
  ```
- **Note**: Works without wallet connection - shows data for the specified wallet

### 3. Preview
- **Mode**: `preview`
- **Description**: Uses mock data for development and debugging
- **Requires**: Nothing (uses built-in mock data)
- **Usage**: Set `NEXT_PUBLIC_DATA_MODE=preview`
- **Note**: Works without wallet connection - shows mock data

## Configuration

Add to your `.env.local` file:

```env
# Data Mode Configuration
# Options: production, observation, preview
NEXT_PUBLIC_DATA_MODE=production
NEXT_PUBLIC_OBSERVATION_WALLET=0x1234567890123456789012345678901234567890
```

## Examples

### Production Mode
```env
NEXT_PUBLIC_DATA_MODE=production
```
- Shows real data from API
- Requires wallet connection
- Shows data for connected wallet

### Observation Mode
```env
NEXT_PUBLIC_DATA_MODE=observation
NEXT_PUBLIC_OBSERVATION_WALLET=0x1234567890123456789012345678901234567890
```
- Shows real data from API
- No wallet connection required
- Shows data for the specified observation wallet
- Useful for debugging specific user data

### Preview Mode
```env
NEXT_PUBLIC_DATA_MODE=preview
```
- Shows mock data
- No wallet connection required
- No API calls made
- Useful for UI development and testing

## Notes

- Mode changes require a restart of the development server
- In observation mode, if `NEXT_PUBLIC_OBSERVATION_WALLET` is not set, it falls back to the connected wallet
- All modes log their current mode to the console for debugging
