import { LocaleCode } from '../context/LocaleContext';
import { useLocale } from '../context/LocaleContext';

type Messages = Record<string, string>;
type Bundle = Record<LocaleCode, Messages>;

export const messages: Bundle = {
  en: {
    send: 'Send',
    receive: 'Receive',
    top_up: 'Top Up',
    token: 'Token',
    nfts: 'NFTs',
    hide_small_asset: 'Hide Small Asset',
    there_s_nothing_here: "There's nothing here",
    select_chain: 'Select Chain',
    actions: 'Actions',
    no_wallet_connected: 'No Wallet Connected',
    please_set_up_your_wallet_first: 'Please set up your wallet first',
    set_up_wallet: 'Set Up Wallet',
    wallet: 'Wallet',
    loading: 'Loading...',
    welcome_back: 'Welcome back,',
    my_wallet: 'My Wallet',
    quick_actions: 'Quick Actions',
    account_information: 'Account Information',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    email_address: 'Email Address',
    confirm_password: 'Confirm Password',
    phone: 'Phone',
    email_verified: 'Email Verified',
    yes: 'Yes',
    no: 'No',
    wallet_setup: 'Wallet Setup',
    create_new_wallet: 'Create New Wallet',
    import_existing_wallet: 'Import Existing Wallet',
    settings: 'Settings',
    account: 'Account',
    preferences: 'Preferences',
    security: 'Security',
    notifications: 'Notifications',
    currency: 'Currency',
    language: 'Language',
    theme: 'Theme',
    number_format: 'Number format',
    hide_balances: 'Hide balances',
    haptic_feedback: 'Haptic feedback',
    language_screen_title: 'Language',
    
    // Transaction
    send_money: 'Send Money',
    receive_money: 'Receive Money',
    amount: 'Amount',
    recipient_address: 'Recipient Address',
    purpose: 'Purpose',
    purpose_placeholder: 'Enter transaction purpose (optional)',
    sending: 'Sending',
    copy_address: 'Copy Address',
    share: 'Share',
    receive_info: 'How to Receive',
    receive_info_text: 'Share your wallet address or QR code with the sender. Make sure they send to the correct network.',
    network: 'Network',
    available_balance: 'Available Balance',
    payment_methods: 'Payment Methods',
    no_payment_methods: 'No payment methods added yet',
    add_payment_method: 'Add Payment Method',
    add_new_payment_method: 'Add New Payment Method',
    payment_methods_placeholder: 'Add or manage your payment methods.',
    processing: 'Processing',
    wallet_address: 'Wallet Address',
    
    // KYC Camera Screen
    kyc_camera_permission_needed: 'Permission needed',
    kyc_camera_permission_message: 'Camera access is required to capture your document.',
    kyc_camera_error: 'Error',
    kyc_camera_not_ready: 'Camera not ready. Please wait a moment and try again.',
    kyc_camera_error_title: 'Camera Error',
    kyc_camera_failed_photo: 'Failed to take photo. ',
    kyc_camera_capture_failed: 'Camera capture failed. Please try again.',
    kyc_camera_crop_failed: 'Failed to crop the image. Please try again.',
    kyc_camera_check_permissions: 'Please try again or check camera permissions.',
    kyc_camera_try_again: 'Try Again',
    kyc_camera_go_back: 'Go Back',
    kyc_camera_ok: 'OK',
    kyc_camera_no_device: 'No camera device found.',
    kyc_camera_permission_required: 'Camera permission is required.',
    kyc_camera_grant_permission: 'Grant Permission',
    kyc_camera_passport: 'Passport',
    kyc_camera_driver_license: 'Driver License',
    kyc_camera_id_card: 'ID Card',
    kyc_camera_front_side: 'Front Side',
    kyc_camera_back_side: 'Back Side',
    kyc_camera_align_passport: 'Align your passport page',
    kyc_camera_align_id: 'Align your ID inside the frame',
    kyc_camera_hint_subtitle: 'Make sure details are readable and avoid glare.',
    kyc_camera_toggle_torch: 'Toggle torch',
    
    // Wallet Setup Flow
    wallet_setup_title: 'Wallet Setup',
    wallet_setup_set_up_wallet: 'Set Up Your Wallet',
    wallet_setup_description: 'Create a new non-custodial wallet or import an existing one. You have full control of your private keys.',
    wallet_setup_create_new: 'Create New Wallet',
    wallet_setup_import_existing: 'Import Existing Wallet',
    wallet_setup_creating: 'Creating wallet...',
    wallet_setup_error: 'Error',
    wallet_setup_failed_create: 'Failed to create wallet',
    wallet_setup_backup_title: 'Backup Your Wallet',
    wallet_setup_backup_description: 'Write down these 12 words in the exact order shown. This is your recovery phrase - keep it safe and never share it.',
    wallet_setup_generating: 'Generating...',
    wallet_setup_copy: 'Copy',
    wallet_setup_share: 'Share',
    wallet_setup_warning_text: 'Never share your recovery phrase. Anyone with these words can access your wallet.',
    wallet_setup_backed_up: "I've Backed It Up",
    wallet_setup_confirm_title: 'Confirm Your Recovery Phrase',
    wallet_setup_confirm_description: 'Please enter your 12-word recovery phrase to confirm you\'ve backed it up correctly.',
    wallet_setup_confirm_placeholder: 'Enter your 12-word recovery phrase...',
    wallet_setup_confirm_create: 'Confirm & Create Wallet',
    wallet_setup_import_title: 'Import Your Wallet',
    wallet_setup_import_description: 'Choose how you\'d like to import your existing wallet.',
    wallet_setup_recovery_phrase: 'Recovery Phrase (12 words)',
    wallet_setup_recovery_placeholder: 'Enter your 12-word recovery phrase...',
    wallet_setup_import_from_phrase: 'Import from Recovery Phrase',
    wallet_setup_importing: 'Importing...',
    wallet_setup_invalid_mnemonic: 'Invalid Mnemonic',
    wallet_setup_invalid_mnemonic_message: 'Please enter a valid 12-word mnemonic phrase',
    wallet_setup_import_success: 'Wallet imported successfully',
    wallet_setup_import_failed: 'Failed to import wallet',
    wallet_setup_complete_title: 'Wallet Created Successfully!',
    wallet_setup_complete_description: 'Your non-custodial wallet is ready. You have full control of your private keys and funds.',
    wallet_setup_go_dashboard: 'Go to Dashboard',
    wallet_setup_mnemonic_copied: 'Mnemonic phrase copied to clipboard',
    wallet_setup_share_title: 'Wallet Backup',
    wallet_setup_share_message: 'My wallet mnemonic (keep this secure): ',
    wallet_setup_mnemonic_mismatch: 'Mnemonic phrases do not match. Please try again.',
    
    // Wallet Selection & Management
    wallet_select_title: 'Select Wallet',
    wallet_select_add: 'Add Wallet',
    wallet_select_manage: 'Manage',
    wallet_manage_title: 'Manage Wallet',
    wallet_manage_disconnect: 'Disconnect Wallet',
    wallet_manage_disconnect_confirm: 'Are you sure you want to disconnect this wallet?',
    wallet_manage_cancel: 'Cancel',
    wallet_manage_disconnect_action: 'Disconnect',
    
    // Authentication
    sign_out: 'Sign Out',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    create_account: 'Create Account',
    exit_app: 'Exit App',
    exit_app_confirm: 'Are you sure you want to exit?',
    
    // Form Fields
    email_required: 'Email is required',
    email_invalid: 'Please enter a valid email',
    password_required: 'Password is required',
    password_min_length: 'Password must be at least 6 characters',
    full_name_required: 'Full name is required',
    confirm_password_required: 'Please confirm your password',
    passwords_no_match: 'Passwords do not match',
    terms_required: 'You must accept the terms and conditions',
    
    // Form Placeholders
    input_email_placeholder: 'Input Your Email',
    enter_password_placeholder: 'Enter your password',
    enter_full_name_placeholder: 'Enter your full name',
    enter_email_placeholder: 'Enter your email',
    create_password_placeholder: 'Create a password',
    confirm_password_placeholder: 'Confirm your password',
    
    // Auth Errors
    sign_in_failed: 'Sign In Failed',
    failed_send_otp: 'Failed to Send OTP',
    try_again_later: 'Please try again later.',
    invalid_code: 'Invalid Code',
    invalid_code_message: 'Please enter a valid 6-digit code',
    verification_failed: 'Verification Failed',
    max_attempts_exceeded: 'Maximum attempts exceeded',
    code_sent: 'Code Sent',
    code_sent_message: 'A new verification code has been sent to',
    failed_resend: 'Failed to Resend',
    
    // Email OTP Verification
    verify_your_email: 'Verify Your Email',
    enter_verification_code: 'Enter Your\nVerification Code',
    otp_sent_to_email: 'Enter the OTP code that we have sent to your email',
    verifying: 'Verifying...',
    resend_otp_in: 'Resend OTP in',
    didnt_receive_code: 'Didn\'t receive the code?',
    resend_code: 'Resend Code',
    
    // Forgot Password
    reset_password: 'Reset Password',
    forgot_password: 'Forgot Password?',
    forgot_password_description: 'Enter your email address and we\'ll send you a link to reset your password',
    check_your_email: 'Check Your Email',
    password_reset_link_sent: 'We\'ve sent a password reset link to',
    send_reset_link: 'Send Reset Link',
    reset_failed: 'Reset Failed',
    back_to_sign_in: 'Back to Sign In',
    
    // Sign In/Up Footer
    no_account: "Don't have an account?",
    create_one: 'Create One',
    have_account: 'Already have an account?',
    sign_in_here: 'Sign In',
    
    // Terms and Privacy
    i_agree_to: 'I agree to the',
    terms_of_service: 'Terms of Service',
    and: 'and',
    privacy_policy: 'Privacy Policy',
    
    // Home Screen
    account_verification: 'Account Verification',
    kyc_verified: 'KYC Verified',
    kyc_under_review: 'KYC Under Review',
    kyc_rejected: 'KYC Rejected',
    kyc_pending: 'KYC Pending',
    account_verification_required: 'Account Verification Required',
    kyc_verification_message: 'Please complete your KYC verification to access all features of Nani Wallet.',
    kyc_banner_pending: 'Your KYC verification is under review. Some features may be limited.',
    kyc_banner_not_started: 'Complete your KYC verification to unlock all wallet features.',
    kyc_description_pending: 'We\'re reviewing your documents. This usually takes 1-3 business days.',
    kyc_description_rejected: 'Your verification was rejected. Please retry with correct documents.',
    kyc_description_not_started: 'Complete your verification to access all wallet features.',
    start_verification: 'Start Verification',
    start: 'Start',
    retry: 'Retry',
    nani_wallet_title: 'Nani Wallet',
    nani_wallet_description: 'Your trusted partner for Halal financial management and Islamic banking solutions.',
    zakat_calculator: 'Zakat Calculator',
    investments: 'Investments',
    
    // Preferences
    primary_color: 'Primary Color',
    
    // Wallet Dashboard
    all_network: 'All Network',
    disconnect_wallet: 'Disconnect Wallet',
    disconnect_wallet_confirm: 'Are you sure you want to disconnect your wallet?',
    cancel: 'Cancel',
    disconnect: 'Disconnect',
    error: 'Error',
    failed_disconnect_wallet: 'Failed to disconnect wallet',
    no_address: 'No Address',
    address_copied: 'Address copied to clipboard',
    coming_soon: 'Coming soon',
    
    // New UI Elements
    savings: 'Savings',
    select_token: 'Select Token',
    search: 'Search',
    top_up_btc: 'Top Up BTC',
    testnet_tokens: 'Testnet Tokens',
    testnet_description: 'Testnet tokens have no real value and are used for testing purposes only. Use the faucets below to get free testnet tokens.',
    your_bitcoin_testnet_address: 'YOUR BITCOIN TESTNET ADDRESS',
    network_bitcoin_testnet: 'Network: Bitcoin Testnet',
    payment_method: 'PAYMENT METHOD',
    select_payment_method: 'Select Payment Method',
    available_faucets: 'Available Faucets',
    bitcoin_testnet_faucet: 'Bitcoin Testnet Faucet',
    get_free_bitcoin_testnet_coins: 'Get free Bitcoin testnet coins',
    open_faucet: 'Open Faucet',
    
    // Transaction History
    transaction_history: 'Transaction History',
    all: 'All',
    sent: 'Sent',
    received: 'Received',
    from: 'From:',
    to: 'To:',
    confirmed: 'Confirmed',
    pending: 'Pending',
    failed: 'Failed',
    cancelled: 'Cancelled',
    just_now: 'Just now',
    
    // Time and Date
    minutes_ago: '{count} minutes ago',
    hours_ago: '{count} hours ago',
    days_ago: '{count} days ago',
    weeks_ago: '{count} weeks ago',
    months_ago: '{count} months ago',
    
    // Tokens and Networks
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    bitcoin_testnet: 'Bitcoin Testnet',
    ethereum_testnet: 'Ethereum Testnet',
    solana_testnet: 'Solana Testnet',
    
    // Loading and States
    loading_more: 'Loading more...',
    no_transactions: 'No transactions found',
    no_tokens: 'No tokens found',
    transaction_history_will_appear: 'Your transaction history will appear here once you start making transactions.',
    try_again: 'Try Again',
    
    // Wallet Actions
    send_transaction: 'Send Transaction',
    receive_transaction: 'Receive Transaction',
    transaction_sent: 'Transaction Sent',
    transaction_received: 'Transaction Received',
    transaction_failed: 'Transaction Failed',
    
    // Copy and Share
    copy: 'Copy',
    copied: 'Copied',
    share_address: 'Share Address',
    
    // Balance and Amount
    balance: 'Balance',
    total_balance: 'Total Balance',
    hide_small_assets: 'Hide Small Asset',
    show_all_assets: 'Show All Assets',
    
    // Network and Address
    address: 'Address',
    
    // Status Messages
    success: 'Success',
    error_occurred: 'An error occurred',
    please_try_again: 'Please try again',
    something_went_wrong: 'Something went wrong',
    
    // Currency and Conversion
    currency_conversion_display: '{from} = {to} (Rate: {rate})',
    
    // Send Dialog
    max: 'MAX',
    please_enter_recipient_address: 'Please enter recipient address',
    please_enter_valid_amount: 'Please enter a valid amount',
    insufficient_balance: 'Insufficient balance',
    wallet_mnemonic_not_available: 'Wallet mnemonic not available',
    unknown_error_occurred: 'Unknown error occurred',
    failed_to_send_transaction: 'Failed to send transaction. Please try again.',
    
    // Receive Dialog
    failed_to_copy_address: 'Failed to copy address',
    failed_to_share: 'Failed to share',
    only_send_asset_to_address: 'Only send',
    asset_to_this_address: 'Asset to this address',
    unknown_network: 'Unknown Network',
    no_wallet_address_available: 'No wallet address available to share',
    share_qr_code: 'Share QR Code',
    
    // Top Up Screen
    cannot_open_url: 'Cannot open this URL',
    failed_to_open_faucet_link: 'Failed to open faucet link',
    your_address: 'Your Address',
    no_faucets_available_for_this_token: 'No faucets available for this token',
    loading_payment_methods: 'Loading payment methods...',
    no_payment_methods_available: 'No payment methods available',
    add_payment_methods_in_settings_to_top_up_your_wallet: 'Add payment methods in Settings to top up your wallet',
  },
  so: {
    send: 'Tuma',
    receive: 'Pokea',
    top_up: 'Ku Dar',
    welcome_back: 'Ku soo dhowow,',
    my_wallet: 'Boorsadayda',
    quick_actions: 'Ficillo Degdeg ah',
    account_information: 'Macluumaadka Akoonka',
    email: 'Email',
    password: 'Password',
    full_name: 'Magaca Buuxa',
    email_address: 'Cinwaanka Email',
    confirm_password: 'Xaqiiji Password',
    phone: 'Taleefan',
    email_verified: 'Email la xaqiijiyay',
    yes: 'Haa',
    no: 'Maya',
    wallet_setup: 'Dejinta Boorsada',
    create_new_wallet: 'Abuur Boorso Cusub',
    import_existing_wallet: 'Soo dejiso Boorso Hore',
    settings: 'Dejinta',
    account: 'Akoon',
    preferences: 'Doorbidid',
    security: 'Amniga',
    notifications: 'Ogeysiisyo',
    currency: 'Lacag',
    language: 'Luuqad',
    theme: 'Mowduuc',
    number_format: 'Qaabka tirooyinka',
    hide_balances: 'Qari hadhaaga',
    haptic_feedback: 'Haptic feedback',
    language_screen_title: 'Luuqad',
    
    // Transaction
    send_money: 'Dir Lacag',
    receive_money: 'Hel Lacag',
    amount: 'Qadarka',
    recipient_address: 'Cinwaanka Qaataha',
    purpose: 'Ujeeddo',
    purpose_placeholder: 'Geli ujeeddo laxaadka (ikhtiyaari)',
    sending: 'Diritaanka',
    copy_address: 'Nuqul Cinwaanka',
    share: 'Wadaag',
    receive_info: 'Sida Loo Helo',
    receive_info_text: 'Wadaag cinwaanka boorsadaaga ama QR code-ka la diriyaha. Hubi inay ku dirto shabakada saxda ah.',
    network: 'Shabakad',
    available_balance: 'Hadhaag La Heli Karo',
    payment_methods: 'Hababka Lacag Bixinta',
    no_payment_methods: 'Weli lama dheerin hababka lacag bixinta',
    add_payment_method: 'Ku Dar Habka Lacag Bixinta',
    add_new_payment_method: 'Ku Dar Hab Cusub oo Lacag Bixinta',
    payment_methods_placeholder: 'Ku dar ama maamul hababka lacag bixintaada.',
    processing: 'Habaynta',
    wallet_address: 'Cinwaanka Boorsada',
    
    // KYC Camera Screen
    kyc_camera_permission_needed: 'Ogolaansho loo baahan yahay',
    kyc_camera_permission_message: 'Helitaanka kaameeradda ayaa loo baahan yahay si aad u sawirto dukumeentiyaadka.',
    kyc_camera_error: 'Qalad',
    kyc_camera_not_ready: 'Kaameeraddu ma diyaar ahan. Fadlan dhawr daqiiqo sug oo isku day mar kale.',
    kyc_camera_error_title: 'Qalad Kaameerad',
    kyc_camera_failed_photo: 'Sawirka qaadashada ayaa fashilantay. ',
    kyc_camera_capture_failed: 'Sawir qaadashada kaameerad ayaa fashilantay. Fadlan isku day mar kale.',
    kyc_camera_crop_failed: 'Sawirka googooynta ayaa fashilantay. Fadlan isku day mar kale.',
    kyc_camera_check_permissions: 'Fadlan isku day mar kale ama hubi ogolaanshaha kaameeradda.',
    kyc_camera_try_again: 'Isku Day Mar Kale',
    kyc_camera_go_back: 'Dib U Noqo',
    kyc_camera_ok: 'Haa',
    kyc_camera_no_device: 'Aaladda kaameeradda lama helin.',
    kyc_camera_permission_required: 'Ogolaansha kaameeradda ayaa loo baahan yahay.',
    kyc_camera_grant_permission: 'Ogolaansho Sii',
    kyc_camera_passport: 'Baasaboor',
    kyc_camera_driver_license: 'Shatiga Wadista',
    kyc_camera_id_card: 'Kaardhka Aqoonsiga',
    kyc_camera_front_side: 'Dhinaca Hore',
    kyc_camera_back_side: 'Dhinaca Dambe',
    kyc_camera_align_passport: 'Ku hagaaji bogga baasaboorkaaga',
    kyc_camera_align_id: 'Ku hagaaji aqoonsigaaga gudaha sanduuqa',
    kyc_camera_hint_subtitle: 'Hubi in faahfaahinta la akhrisan karo lagana fogaado dhalaalka.',
    kyc_camera_toggle_torch: 'Ku shida/dami laydka',
    
    // Wallet Setup Flow
    wallet_setup_title: 'Dejinta Boorsada',
    wallet_setup_set_up_wallet: 'Deji Boorsadaada',
    wallet_setup_description: 'Abuur boorso cusub oo aan la xukumin ama soo dejiso mid hore. Waxaad si buuxda u xukuntaa fureyaashaaga gaarka ah.',
    wallet_setup_create_new: 'Abuur Boorso Cusub',
    wallet_setup_import_existing: 'Soo Dejiso Boorso Hore',
    wallet_setup_creating: 'Boorsada la abuurayo...',
    wallet_setup_error: 'Qalad',
    wallet_setup_failed_create: 'Abuurista boorsada ayaa fashilantay',
    wallet_setup_backup_title: 'Kaydso Boorsadaada',
    wallet_setup_backup_description: 'Qor 12-ka eray ee kala duwan sida la tusay. Tani waa weedhahaaga soo celinta - ammaan u hay hana la wadaagin qof kale.',
    wallet_setup_generating: 'La diyaargaraynayo...',
    wallet_setup_copy: 'Nuqul',
    wallet_setup_share: 'Wadaag',
    wallet_setup_warning_text: 'Waligiiba ha la wadaagin weedhahaaga soo celinta. Qof kasta oo haysta erayadan wuu geli karaa boorsadaada.',
    wallet_setup_backed_up: 'Waan Kaydiyay',
    wallet_setup_confirm_title: 'Xaqiiji Weedhahaaga Soo Celinta',
    wallet_setup_confirm_description: 'Fadlan geli 12-ka eray ee soo celinta si aad u xaqiijiso inaad si sax ah u kaydisay.',
    wallet_setup_confirm_placeholder: 'Geli 12-ka eray ee soo celinta...',
    wallet_setup_confirm_create: 'Xaqiiji oo Abuur Boorsada',
    wallet_setup_import_title: 'Soo Dejiso Boorsadaada',
    wallet_setup_import_description: 'Dooro sida aad u doonayso inaad soo dejiso boorsadaada jirta.',
    wallet_setup_recovery_phrase: 'Weedhaaha Soo Celinta (12 eray)',
    wallet_setup_recovery_placeholder: 'Geli 12-ka eray ee soo celinta...',
    wallet_setup_import_from_phrase: 'Ka Soo Dejiso Weedhaaha Soo Celinta',
    wallet_setup_importing: 'Soo dejinaya...',
    wallet_setup_invalid_mnemonic: 'Weedhaha Aan Saxayn',
    wallet_setup_invalid_mnemonic_message: 'Fadlan geli weedho sax ah oo 12 eray ah',
    wallet_setup_import_success: 'Boorsada si guul leh ayaa loo soo dejiyay',
    wallet_setup_import_failed: 'Soo dejinta boorsada ayaa fashilantay',
    wallet_setup_complete_title: 'Boorsada Si Guul leh Ayaa Loo Abuuray!',
    wallet_setup_complete_description: 'Boorsadaada aan la xukumin way diyaar tahay. Waxaad si buuxda u xukuntaa fureyaashaaga gaarka ah iyo lacagtaada.',
    wallet_setup_go_dashboard: 'Aad Dashboard-ka',
    wallet_setup_mnemonic_copied: 'Weedhaaha soo celinta ayaa loo nuqlay clipboard-ka',
    wallet_setup_share_title: 'Kaydinta Boorsada',
    wallet_setup_share_message: 'Weedhaahayga boorsada (ammaan u hay): ',
    wallet_setup_mnemonic_mismatch: 'Weedhaaha soo celinta ma isku mid ahan. Fadlan mar kale isku day.',
    
    // Wallet Selection & Management
    wallet_select_title: 'Dooro Boorsada',
    wallet_select_add: 'Ku Dar Boorso',
    wallet_select_manage: 'Maamul',
    wallet_manage_title: 'Maamul Boorsada',
    wallet_manage_disconnect: 'Ka Gooy Boorsada',
    wallet_manage_disconnect_confirm: 'Ma hubtaa inaad ka goyn rabto boorsadan?',
    wallet_manage_cancel: 'Jooji',
    wallet_manage_disconnect_action: 'Ka Gooy',
    
    // Authentication
    sign_out: 'Ka Bax',
    sign_in: 'Gal',
    sign_up: 'Iscasilasho',
    create_account: 'Abuur Akoon',
    exit_app: 'Ka Bax App-ka',
    exit_app_confirm: 'Ma hubtaa inaad ka baxayso?',
    
    // Form Fields
    email_required: 'Email ayaa loo baahan yahay',
    email_invalid: 'Fadlan geli email sax ah',
    password_required: 'Password ayaa loo baahan yahay',
    password_min_length: 'Password-ku waa inuu noqdaa ugu yaraan 6 xaraf',
    full_name_required: 'Magaca buuxa ayaa loo baahan yahay',
    confirm_password_required: 'Fadlan xaqiiji password-ka',
    passwords_no_match: 'Password-yadu ma isku mid ahan',
    terms_required: 'Waa inaad aqbashid shuruudaha iyo xaaladaha',
    
    // Form Placeholders
    input_email_placeholder: 'Geli Email-kaaga',
    enter_password_placeholder: 'Geli password-kaaga',
    enter_full_name_placeholder: 'Geli magacaaga buuxa',
    enter_email_placeholder: 'Geli email-kaaga',
    create_password_placeholder: 'Abuur password',
    confirm_password_placeholder: 'Xaqiiji password-ka',
    
    // Auth Errors
    sign_in_failed: 'Galitaanka Waa Fashilantay',
    failed_send_otp: 'Diritaanka OTP Waa Fashilantay',
    try_again_later: 'Fadlan mar kale isku day goor dambe.',
    invalid_code: 'Kood Aan Sax Ahayn',
    invalid_code_message: 'Fadlan geli kood sax ah oo 6 tiro ah',
    verification_failed: 'Xaqiijinta Waa Fashilantay',
    max_attempts_exceeded: 'Tirada ugu badan ee isku dayga ayaa la dhaafay',
    code_sent: 'Kood La Diray',
    code_sent_message: 'Kood cusub oo xaqiijin ah ayaa loo diray',
    failed_resend: 'Dib u Diritaanka Waa Fashilantay',
    
    // Email OTP Verification
    verify_your_email: 'Xaqiiji Email-kaaga',
    enter_verification_code: 'Geli Koodka\nXaqiijinta',
    otp_sent_to_email: 'Geli koodka OTP ee aan ku dirnay email-kaaga',
    verifying: 'La Xaqiijinayaa...',
    resend_otp_in: 'Dib u Dir OTP',
    didnt_receive_code: 'Ma helin koodka?',
    resend_code: 'Dib U Dir Koodka',
    
    // Forgot Password
    reset_password: 'Cusbooneysii Password',
    forgot_password: 'Halmaamay Password?',
    forgot_password_description: 'Geli cinwaanka email-kaaga waxaan ku dirnaa link si aad u cusbooneysiiso password-kaaga',
    check_your_email: 'Hubi Email-kaaga',
    password_reset_link_sent: 'Waxaan ku dirnay link cusbooneysii password',
    send_reset_link: 'Dir Link Cusbooneysii',
    reset_failed: 'Cusbooneysiinta Waa Fashilantay',
    back_to_sign_in: 'Dib U Noqo Galitaanka',
    
    // Sign In/Up Footer
    no_account: 'Akoon ma lihid?',
    create_one: 'Mid Abuur',
    have_account: 'Akoon ma leedahay?',
    sign_in_here: 'Halkan Gal',
    
    // Terms and Privacy
    i_agree_to: 'Waxaan aqbalay',
    terms_of_service: 'Shuruudaha Adeegga',
    and: 'iyo',
    privacy_policy: 'Qaanuunka Sirta',
    
    // Home Screen
    account_verification: 'Xaqiijinta Akoonka',
    kyc_verified: 'KYC La Xaqiijiyay',
    kyc_under_review: 'KYC Waa La Eegayaa',
    kyc_rejected: 'KYC Waa La Diiday',
    kyc_pending: 'KYC Waa La Sugayaa',
    account_verification_required: 'Xaqiijinta Akoonka Ayaa Loo Baahan Yahay',
    kyc_verification_message: 'Fadlan dhammee xaqiijinta KYC-ga si aad u hesho dhammaan sifooyinka Nani Wallet.',
    kyc_banner_pending: 'Xaqiijinta KYC-gaaga ayaa la eegayaa. Sifooyinka qaarkood way xaddidan yihiin.',
    kyc_banner_not_started: 'Dhammee xaqiijinta KYC-ga si aad u furtid dhammaan sifooyinka boorsada.',
    kyc_description_pending: 'Waxaan eegaynaa dukumeentiyaadka. Tani waxay qaadataa 1-3 maalmood shaqo.',
    kyc_description_rejected: 'Xaqiijintaada waa la diiday. Fadlan mar kale isku day dukumeenti saxan.',
    kyc_description_not_started: 'Dhammee xaqiijintaada si aad u hesho dhammaan sifooyinka boorsada.',
    start_verification: 'Bilow Xaqiijinta',
    start: 'Bilow',
    retry: 'Mar Kale Isku Day',
    nani_wallet_title: 'Nani Wallet',
    nani_wallet_description: 'Lamaanaha aad ku kalsoon tahay maamulka maaliyadda Xalaal ah iyo xalalka bangiga Islaamka.',
    zakat_calculator: 'Xisaabiyaha Zakada',
    investments: 'Maalgashiyo',
    
    // Preferences
    primary_color: 'Midabka Aasaasiga ah',
    
    // Wallet Dashboard
    all_network: 'Dhammaan Shabakadaha',
    disconnect_wallet: 'Ka Gooy Boorsada',
    disconnect_wallet_confirm: 'Ma hubtaa inaad ka goyn rabto boorsadaada?',
    cancel: 'Jooji',
    disconnect: 'Ka Gooy',
    error: 'Qalad',
    failed_disconnect_wallet: 'Ka goynta boorsada ayaa fashilantay',
    no_address: 'Cinwaan Ma Jiro',
    wallet: 'Boorso',
    address_copied: 'Cinwaanka ayaa loo nuqlay clipboard-ka',
    coming_soon: 'Waa imanayaa dhowaan',
    
    // New UI Elements
    savings: 'Kaydinta',
    select_token: 'Dooro Token',
    search: 'Raadi',
    top_up_btc: 'Ku Dar BTC',
    testnet_tokens: 'Token-ka Testnet',
    testnet_description: 'Token-ka testnet ma laha qiimo dhabta ah waxayna loo isticmaalaa tijaabada kaliya. Isticmaal faucet-yada hoose si aad u hesho token-ka testnet bilaashka ah.',
    your_bitcoin_testnet_address: 'CINWAANKAAGA BITCOIN TESTNET',
    network_bitcoin_testnet: 'Shabakad: Bitcoin Testnet',
    payment_method: 'HABKA LACAG BIXINTA',
    select_payment_method: 'Dooro Habka Lacag Bixinta',
    available_faucets: 'Faucet-yada La Heli Karo',
    bitcoin_testnet_faucet: 'Bitcoin Testnet Faucet',
    get_free_bitcoin_testnet_coins: 'Hel Bitcoin testnet coins bilaash ah',
    open_faucet: 'Fur Faucet',
    
    // Transaction History
    transaction_history: 'Taariikhda Laxaadka',
    all: 'Dhammaan',
    sent: 'La Diray',
    received: 'La Helay',
    from: 'Ka:',
    to: 'U:',
    confirmed: 'La Xaqiijiyay',
    pending: 'La Sugayaa',
    failed: 'Fashilantay',
    cancelled: 'La Joojiyay',
    just_now: 'Hadda',
    
    // Time and Date
    minutes_ago: '{count} daqiiqo ka hor',
    hours_ago: '{count} saac ka hor',
    days_ago: '{count} maalmood ka hor',
    weeks_ago: '{count} usbuuc ka hor',
    months_ago: '{count} bilood ka hor',
    
    // Tokens and Networks
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    bitcoin_testnet: 'Bitcoin Testnet',
    ethereum_testnet: 'Ethereum Testnet',
    solana_testnet: 'Solana Testnet',
    
    // Loading and States
    loading: 'La dejinaya...',
    loading_more: 'La dejinaya dheeraad...',
    no_transactions: 'Laxaad lama helin',
    no_tokens: 'Token lama helin',
    transaction_history_will_appear: 'Taariikhda laxaadkaaga ayaa halkan muujin doonta marka aad bilowdo laxaadka.',
    try_again: 'Mar Kale Isku Day',
    
    // Wallet Actions
    send_transaction: 'Dir Laxaad',
    receive_transaction: 'Hel Laxaad',
    transaction_sent: 'Laxaadka La Diray',
    transaction_received: 'Laxaadka La Helay',
    transaction_failed: 'Laxaadka Fashilantay',
    
    // Copy and Share
    copy: 'Nuqul',
    copied: 'La Nuqlay',
    share_address: 'Wadaag Cinwaanka',
    
    // Balance and Amount
    balance: 'Hadhaag',
    total_balance: 'Hadhaag Guud',
    hide_small_assets: 'Qari Hantida Yar',
    show_all_assets: 'Tus Dhammaan Hantida',
    
    // Network and Address
    address: 'Cinwaanka',
    
    // Status Messages
    success: 'Guul',
    error_occurred: 'Qalad ayaa dhacay',
    please_try_again: 'Fadlan mar kale isku day',
    something_went_wrong: 'Wax qalad ayaa dhacay',
    
    // Currency and Conversion
    currency_conversion_display: '{from} = {to} (Heerka: {rate})',
    
    // Send Dialog
    max: 'MAX',
    no_wallet_connected: 'Boorso ma xidhiidhin',
    please_enter_recipient_address: 'Fadlan geli cinwaanka qaataha',
    please_enter_valid_amount: 'Fadlan geli qadar sax ah',
    insufficient_balance: 'Hadhaag ku filan',
    wallet_mnemonic_not_available: 'Weedhaaha boorsada ma la helin',
    unknown_error_occurred: 'Qalad aan la aqoon ayaa dhacay',
    failed_to_send_transaction: 'Diritaanka laxaadka ayaa fashilantay. Fadlan mar kale isku day.',
    token: 'Token',
    
    // Receive Dialog
    failed_to_copy_address: 'Nuqlashada cinwaanka ayaa fashilantay',
    failed_to_share: 'Wadaajinta ayaa fashilantay',
    only_send_asset_to_address: 'Kaliya dir',
    asset_to_this_address: 'Hanti cinwaanka',
    unknown_network: 'Shabakad Aan La Aqoon',
    no_wallet_address_available: 'Cinwaanka boorsada ma la helin',
    share_qr_code: 'Wadaag QR Code',
    
    // Top Up Screen
    cannot_open_url: 'Ma furi karo URL-kan',
    failed_to_open_faucet_link: 'Furista link-ka faucet ayaa fashilantay',
    your_address: 'Cinwaankaaga',
    no_faucets_available_for_this_token: 'Ma jiroan faucet-yo token-kan loo diyaaray',
    loading_payment_methods: 'La dejinaya hababka lacag bixinta...',
    no_payment_methods_available: 'Ma jiroan hababka lacag bixinta',
    add_payment_methods_in_settings_to_top_up_your_wallet: 'Ku dar hababka lacag bixinta Dejinta si aad u ku darto boorsadaada',
  },
  ar: {
    send: 'أرسل',
    receive: 'استلم',
    top_up: 'شحن',
    token: 'الرمز',
    nfts: 'النفتات',
    hide_small_asset: 'إخفاء الأصول الصغيرة',
    there_s_nothing_here: 'لا يوجد هنا',
    select_chain: 'اختر الشبكة',
    actions: 'الإجراءات',
    no_wallet_connected: 'لا يوجد محفظة متصلة',
    please_set_up_your_wallet_first: 'يرجى إعداد محفظتك أولاً',
    set_up_wallet: 'إعداد المحفظة',
    wallet: 'المحفظة',
    loading: 'جاري التحميل...',
    welcome_back: 'مرحباً بعودتك،',
    my_wallet: 'محفظتي',
    quick_actions: 'إجراءات سريعة',
    account_information: 'معلومات الحساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    full_name: 'الاسم الكامل',
    email_address: 'عنوان البريد الإلكتروني',
    confirm_password: 'تأكيد كلمة المرور',
    phone: 'الهاتف',
    email_verified: 'تأكيد البريد الإلكتروني',
    yes: 'نعم',
    no: 'لا',
    wallet_setup: 'إعداد المحفظة',
    create_new_wallet: 'إنشاء محفظة جديدة',
    import_existing_wallet: 'استيراد محفظة موجودة',
    settings: 'الإعدادات',
    account: 'الحساب',
    preferences: 'التفضيلات',
    security: 'الأمان',
    notifications: 'الإشعارات',
    currency: 'العملة',
    language: 'اللغة',
    theme: 'السمة',
    number_format: 'تنسيق الأرقام',
    hide_balances: 'إخفاء الأرصدة',
    haptic_feedback: 'الاهتزاز اللمسي',
    language_screen_title: 'اللغة',
    
    // Transaction
    send_money: 'إرسال الأموال',
    receive_money: 'استقبال الأموال',
    amount: 'المبلغ',
    recipient_address: 'عنوان المستلم',
    purpose: 'الغرض',
    purpose_placeholder: 'أدخل غرض المعاملة (اختياري)',
    sending: 'جاري الإرسال',
    copy_address: 'نسخ العنوان',
    share: 'مشاركة',
    receive_info: 'كيفية الاستقبال',
    receive_info_text: 'شارك عنوان محفظتك أو رمز QR مع المرسل. تأكد من إرسالها إلى الشبكة الصحيحة.',
    network: 'الشبكة',
    available_balance: 'الرصيد المتاح',
    payment_methods: 'طرق الدفع',
    no_payment_methods: 'لم يتم إضافة طرق دفع بعد',
    add_payment_method: 'إضافة طريقة دفع',
    add_new_payment_method: 'إضافة طريقة دفع جديدة',
    payment_methods_placeholder: 'إضافة أو إدارة طرق الدفع الخاصة بك.',
    processing: 'جاري المعالجة',
    wallet_address: 'عنوان المحفظة',
    
    // KYC Camera Screen
    kyc_camera_permission_needed: 'إذن مطلوب',
    kyc_camera_permission_message: 'الوصول للكاميرا مطلوب لالتقاط وثائقك.',
    kyc_camera_error: 'خطأ',
    kyc_camera_not_ready: 'الكاميرا غير جاهزة. يرجى الانتظار لحظة والمحاولة مرة أخرى.',
    kyc_camera_error_title: 'خطأ في الكاميرا',
    kyc_camera_failed_photo: 'فشل في التقاط الصورة. ',
    kyc_camera_capture_failed: 'فشل في التقاط صورة الكاميرا. يرجى المحاولة مرة أخرى.',
    kyc_camera_crop_failed: 'فشل في قص الصورة. يرجى المحاولة مرة أخرى.',
    kyc_camera_check_permissions: 'يرجى المحاولة مرة أخرى أو التحقق من أذونات الكاميرا.',
    kyc_camera_try_again: 'حاول مرة أخرى',
    kyc_camera_go_back: 'العودة',
    kyc_camera_ok: 'حسناً',
    kyc_camera_no_device: 'لم يتم العثور على جهاز كاميرا.',
    kyc_camera_permission_required: 'إذن الكاميرا مطلوب.',
    kyc_camera_grant_permission: 'منح الإذن',
    kyc_camera_passport: 'جواز السفر',
    kyc_camera_driver_license: 'رخصة القيادة',
    kyc_camera_id_card: 'بطاقة الهوية',
    kyc_camera_front_side: 'الجانب الأمامي',
    kyc_camera_back_side: 'الجانب الخلفي',
    kyc_camera_align_passport: 'اضبط صفحة جواز سفرك',
    kyc_camera_align_id: 'اضبط هويتك داخل الإطار',
    kyc_camera_hint_subtitle: 'تأكد من أن التفاصيل مقروءة وتجنب الوهج.',
    kyc_camera_toggle_torch: 'تبديل الفلاش',
    
    // Wallet Setup Flow
    wallet_setup_title: 'إعداد المحفظة',
    wallet_setup_set_up_wallet: 'إعداد محفظتك',
    wallet_setup_description: 'أنشئ محفظة جديدة غير حراسة أو استورد محفظة موجودة. لديك السيطرة الكاملة على مفاتيحك الخاصة.',
    wallet_setup_create_new: 'إنشاء محفظة جديدة',
    wallet_setup_import_existing: 'استيراد محفظة موجودة',
    wallet_setup_creating: 'جاري إنشاء المحفظة...',
    wallet_setup_error: 'خطأ',
    wallet_setup_failed_create: 'فشل في إنشاء المحفظة',
    wallet_setup_backup_title: 'نسخ احتياطي لمحفظتك',
    wallet_setup_backup_description: 'اكتب هذه الكلمات الـ12 بالترتيب المعروض بالضبط. هذه هي عبارة الاسترداد - احتفظ بها آمنة ولا تشاركها أبداً.',
    wallet_setup_generating: 'جاري الإنشاء...',
    wallet_setup_copy: 'نسخ',
    wallet_setup_share: 'مشاركة',
    wallet_setup_warning_text: 'لا تشارك عبارة الاسترداد أبداً. أي شخص لديه هذه الكلمات يمكنه الوصول إلى محفظتك.',
    wallet_setup_backed_up: 'لقد قمت بعمل نسخة احتياطية',
    wallet_setup_confirm_title: 'تأكيد عبارة الاسترداد',
    wallet_setup_confirm_description: 'يرجى إدخال عبارة الاسترداد المكونة من 12 كلمة لتأكيد أنك قمت بعمل نسخة احتياطية بشكل صحيح.',
    wallet_setup_confirm_placeholder: 'أدخل عبارة الاسترداد المكونة من 12 كلمة...',
    wallet_setup_confirm_create: 'تأكيد وإنشاء المحفظة',
    wallet_setup_import_title: 'استيراد محفظتك',
    wallet_setup_import_description: 'اختر كيف تريد استيراد محفظتك الموجودة.',
    wallet_setup_recovery_phrase: 'عبارة الاسترداد (12 كلمة)',
    wallet_setup_recovery_placeholder: 'أدخل عبارة الاسترداد المكونة من 12 كلمة...',
    wallet_setup_import_from_phrase: 'استيراد من عبارة الاسترداد',
    wallet_setup_importing: 'جاري الاستيراد...',
    wallet_setup_invalid_mnemonic: 'عبارة تذكيرية غير صحيحة',
    wallet_setup_invalid_mnemonic_message: 'يرجى إدخال عبارة تذكيرية صحيحة مكونة من 12 كلمة',
    wallet_setup_import_success: 'تم استيراد المحفظة بنجاح',
    wallet_setup_import_failed: 'فشل في استيراد المحفظة',
    wallet_setup_complete_title: 'تم إنشاء المحفظة بنجاح!',
    wallet_setup_complete_description: 'محفظتك غير المحروسة جاهزة. لديك السيطرة الكاملة على مفاتيحك الخاصة وأموالك.',
    wallet_setup_go_dashboard: 'الذهاب إلى لوحة التحكم',
    wallet_setup_mnemonic_copied: 'تم نسخ عبارة التذكير إلى الحافظة',
    wallet_setup_share_title: 'نسخ احتياطي للمحفظة',
    wallet_setup_share_message: 'عبارة التذكير لمحفظتي (احتفظ بها آمنة): ',
    wallet_setup_mnemonic_mismatch: 'عبارات التذكير غير متطابقة. يرجى المحاولة مرة أخرى.',
    
    // Wallet Selection & Management
    wallet_select_title: 'اختيار المحفظة',
    wallet_select_add: 'إضافة محفظة',
    wallet_select_manage: 'إدارة',
    wallet_manage_title: 'إدارة المحفظة',
    wallet_manage_disconnect: 'قطع اتصال المحفظة',
    wallet_manage_disconnect_confirm: 'هل أنت متأكد من أنك تريد قطع اتصال هذه المحفظة؟',
    wallet_manage_cancel: 'إلغاء',
    wallet_manage_disconnect_action: 'قطع الاتصال',
    
    // Authentication
    sign_out: 'تسجيل الخروج',
    sign_in: 'تسجيل الدخول',
    sign_up: 'إنشاء حساب',
    create_account: 'إنشاء حساب',
    exit_app: 'إغلاق التطبيق',
    exit_app_confirm: 'هل أنت متأكد من أنك تريد الخروج؟',
    
    // Form Fields
    email_required: 'البريد الإلكتروني مطلوب',
    email_invalid: 'يرجى إدخال بريد إلكتروني صحيح',
    password_required: 'كلمة المرور مطلوبة',
    password_min_length: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    full_name_required: 'الاسم الكامل مطلوب',
    confirm_password_required: 'يرجى تأكيد كلمة المرور',
    passwords_no_match: 'كلمات المرور غير متطابقة',
    terms_required: 'يجب قبول الشروط والأحكام',
    
    // Form Placeholders
    input_email_placeholder: 'أدخل بريدك الإلكتروني',
    enter_password_placeholder: 'أدخل كلمة المرور',
    enter_full_name_placeholder: 'أدخل اسمك الكامل',
    enter_email_placeholder: 'أدخل بريدك الإلكتروني',
    create_password_placeholder: 'إنشاء كلمة مرور',
    confirm_password_placeholder: 'تأكيد كلمة المرور',
    
    // Auth Errors
    sign_in_failed: 'فشل تسجيل الدخول',
    failed_send_otp: 'فشل في إرسال رمز التحقق',
    try_again_later: 'يرجى المحاولة مرة أخرى لاحقاً.',
    invalid_code: 'رمز غير صحيح',
    invalid_code_message: 'يرجى إدخال رمز صحيح مكون من 6 أرقام',
    verification_failed: 'فشل التحقق',
    max_attempts_exceeded: 'تم تجاوز الحد الأقصى للمحاولات',
    code_sent: 'تم إرسال الرمز',
    code_sent_message: 'تم إرسال رمز تحقق جديد إلى',
    failed_resend: 'فشل في إعادة الإرسال',
    
    // Email OTP Verification
    verify_your_email: 'تحقق من بريدك الإلكتروني',
    enter_verification_code: 'أدخل رمز\nالتحقق',
    otp_sent_to_email: 'أدخل رمز التحقق الذي أرسلناه إلى بريدك الإلكتروني',
    verifying: 'جاري التحقق...',
    resend_otp_in: 'إعادة إرسال رمز التحقق في',
    didnt_receive_code: 'لم تستلم الرمز؟',
    resend_code: 'إعادة إرسال الرمز',
    
    // Forgot Password
    reset_password: 'إعادة تعيين كلمة المرور',
    forgot_password: 'نسيت كلمة المرور؟',
    forgot_password_description: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور',
    check_your_email: 'تحقق من بريدك الإلكتروني',
    password_reset_link_sent: 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
    send_reset_link: 'إرسال رابط إعادة التعيين',
    reset_failed: 'فشل إعادة التعيين',
    back_to_sign_in: 'العودة إلى تسجيل الدخول',
    
    // Sign In/Up Footer
    no_account: 'ليس لديك حساب؟',
    create_one: 'إنشاء واحد',
    have_account: 'لديك حساب بالفعل؟',
    sign_in_here: 'تسجيل الدخول',
    
    // Terms and Privacy
    i_agree_to: 'أوافق على',
    terms_of_service: 'شروط الخدمة',
    and: 'و',
    privacy_policy: 'سياسة الخصوصية',
    
    // Home Screen
    account_verification: 'التحقق من الحساب',
    kyc_verified: 'تم التحقق من الهوية',
    kyc_under_review: 'التحقق من الهوية قيد المراجعة',
    kyc_rejected: 'تم رفض التحقق من الهوية',
    kyc_pending: 'التحقق من الهوية في الانتظار',
    account_verification_required: 'التحقق من الحساب مطلوب',
    kyc_verification_message: 'يرجى إكمال التحقق من الهوية للوصول إلى جميع ميزات محفظة ناني.',
    kyc_banner_pending: 'التحقق من هويتك قيد المراجعة. قد تكون بعض الميزات محدودة.',
    kyc_banner_not_started: 'أكمل التحقق من هويتك لفتح جميع ميزات المحفظة.',
    kyc_description_pending: 'نحن نراجع مستنداتك. يستغرق هذا عادة من 1-3 أيام عمل.',
    kyc_description_rejected: 'تم رفض التحقق من هويتك. يرجى المحاولة مرة أخرى بمستندات صحيحة.',
    kyc_description_not_started: 'أكمل التحقق من هويتك للوصول إلى جميع ميزات المحفظة.',
    start_verification: 'بدء التحقق',
    start: 'بدء',
    retry: 'إعادة المحاولة',
    nani_wallet_title: 'محفظة ناني',
    nani_wallet_description: 'شريكك الموثوق لإدارة الأموال الحلال وحلول الخدمات المصرفية الإسلامية.',
    zakat_calculator: 'حاسبة الزكاة',
    investments: 'الاستثمارات',
    
    // Preferences
    primary_color: 'اللون الأساسي',
    
    // Wallet Dashboard
    all_network: 'جميع الشبكات',
    disconnect_wallet: 'قطع اتصال المحفظة',
    disconnect_wallet_confirm: 'هل أنت متأكد من أنك تريد قطع اتصال محفظتك؟',
    cancel: 'إلغاء',
    disconnect: 'قطع الاتصال',
    error: 'خطأ',
    failed_disconnect_wallet: 'فشل في قطع اتصال المحفظة',
    no_address: 'لا يوجد عنوان',
    address_copied: 'تم نسخ العنوان إلى الحافظة',
    coming_soon: 'قريباً',
    
    // New UI Elements
    savings: 'المدخرات',
    select_token: 'اختر الرمز المميز',
    search: 'بحث',
    top_up_btc: 'شحن BTC',
    testnet_tokens: 'رموز شبكة الاختبار',
    testnet_description: 'رموز شبكة الاختبار ليس لها قيمة حقيقية وتستخدم لأغراض الاختبار فقط. استخدم الصنابير أدناه للحصول على رموز شبكة الاختبار المجانية.',
    your_bitcoin_testnet_address: 'عنوان البيتكوين لشبكة الاختبار الخاص بك',
    network_bitcoin_testnet: 'الشبكة: بيتكوين شبكة الاختبار',
    payment_method: 'طريقة الدفع',
    select_payment_method: 'اختر طريقة الدفع',
    available_faucets: 'الصنابير المتاحة',
    bitcoin_testnet_faucet: 'صنبور بيتكوين شبكة الاختبار',
    get_free_bitcoin_testnet_coins: 'احصل على عملات بيتكوين شبكة الاختبار مجاناً',
    open_faucet: 'فتح الصنبور',
    
    // Transaction History
    transaction_history: 'تاريخ المعاملات',
    all: 'الكل',
    sent: 'مرسل',
    received: 'مستلم',
    from: 'من:',
    to: 'إلى:',
    confirmed: 'مؤكد',
    pending: 'في الانتظار',
    failed: 'فشل',
    cancelled: 'ملغي',
    just_now: 'الآن',
    
    // Time and Date
    minutes_ago: 'منذ {count} دقيقة',
    hours_ago: 'منذ {count} ساعة',
    days_ago: 'منذ {count} يوم',
    weeks_ago: 'منذ {count} أسبوع',
    months_ago: 'منذ {count} شهر',
    
    // Tokens and Networks
    bitcoin: 'بيتكوين',
    ethereum: 'إيثريوم',
    solana: 'سولانا',
    bitcoin_testnet: 'بيتكوين شبكة الاختبار',
    ethereum_testnet: 'إيثريوم شبكة الاختبار',
    solana_testnet: 'سولانا شبكة الاختبار',
    
    // Loading and States
    loading_more: 'جاري تحميل المزيد...',
    no_transactions: 'لم يتم العثور على معاملات',
    no_tokens: 'لم يتم العثور على رموز مميزة',
    transaction_history_will_appear: 'ستظهر سجل معاملاتك هنا بمجرد بدء إجراء المعاملات.',
    try_again: 'حاول مرة أخرى',
    
    // Wallet Actions
    send_transaction: 'إرسال معاملة',
    receive_transaction: 'استقبال معاملة',
    transaction_sent: 'تم إرسال المعاملة',
    transaction_received: 'تم استقبال المعاملة',
    transaction_failed: 'فشلت المعاملة',
    
    // Copy and Share
    copy: 'نسخ',
    copied: 'تم النسخ',
    share_address: 'مشاركة العنوان',
    
    // Balance and Amount
    balance: 'الرصيد',
    total_balance: 'الرصيد الإجمالي',
    hide_small_assets: 'إخفاء الأصول الصغيرة',
    show_all_assets: 'عرض جميع الأصول',
    
    // Network and Address
    address: 'العنوان',
    
    // Status Messages
    success: 'نجح',
    error_occurred: 'حدث خطأ',
    please_try_again: 'يرجى المحاولة مرة أخرى',
    something_went_wrong: 'حدث خطأ ما',
    
    // Currency and Conversion
    currency_conversion_display: '{from} = {to} (المعدل: {rate})',
    
    // Send Dialog
    max: 'الحد الأقصى',
    please_enter_recipient_address: 'يرجى إدخال عنوان المستلم',
    please_enter_valid_amount: 'يرجى إدخال مبلغ صحيح',
    insufficient_balance: 'رصيد غير كافي',
    wallet_mnemonic_not_available: 'عبارة استرداد المحفظة غير متاحة',
    unknown_error_occurred: 'حدث خطأ غير معروف',
    failed_to_send_transaction: 'فشل في إرسال المعاملة. يرجى المحاولة مرة أخرى.',
    
    // Receive Dialog
    failed_to_copy_address: 'فشل في نسخ العنوان',
    failed_to_share: 'فشل في المشاركة',
    only_send_asset_to_address: 'أرسل فقط',
    asset_to_this_address: 'الأصل إلى هذا العنوان',
    unknown_network: 'شبكة غير معروفة',
    no_wallet_address_available: 'لا يوجد عنوان محفظة متاح للمشاركة',
    share_qr_code: 'مشاركة رمز QR',
    
    // Top Up Screen
    cannot_open_url: 'لا يمكن فتح هذا الرابط',
    failed_to_open_faucet_link: 'فشل في فتح رابط الصنبور',
    your_address: 'عنوانك',
    no_faucets_available_for_this_token: 'لا توجد صنابير متاحة لهذا الرمز المميز',
    loading_payment_methods: 'جاري تحميل طرق الدفع...',
    no_payment_methods_available: 'لا توجد طرق دفع متاحة',
    add_payment_methods_in_settings_to_top_up_your_wallet: 'أضف طرق الدفع في الإعدادات لشحن محفظتك',
  },
  sw: {
    send: 'Tuma',
    receive: 'Pokea',
    top_up: 'Ku Dar',
    token: 'Token',
    nfts: 'NFTs',
    hide_small_asset: 'Hide Small Asset',
    there_s_nothing_here: "There's nothing here",
    select_chain: 'Select Chain',
    actions: 'Actions',
    no_wallet_connected: 'No Wallet Connected',
    please_set_up_your_wallet_first: 'Please set up your wallet first',
    set_up_wallet: 'Set Up Wallet',
    wallet: 'Wallet',
    loading: 'Loading...',
    welcome_back: 'Karibu tena,',
    my_wallet: 'Pochi Yangu',
    quick_actions: 'Vitendo vya Haraka',
    account_information: 'Taarifa za Akaunti',
    email: 'Barua pepe',
    password: 'Nenosiri',
    full_name: 'Jina Kamili',
    email_address: 'Anwani ya Barua Pepe',
    confirm_password: 'Thibitisha Nenosiri',
    phone: 'Simu',
    email_verified: 'Barua pepe imethibitishwa',
    yes: 'Ndiyo',
    no: 'Hapana',
    wallet_setup: 'Usanidi wa Pochi',
    create_new_wallet: 'Unda Pochi Mpya',
    import_existing_wallet: 'Ingiza Pochi Iliyopo',
    settings: 'Mipangilio',
    account: 'Akaunti',
    preferences: 'Mapendeleo',
    security: 'Usalama',
    notifications: 'Arifa',
    currency: 'Sarafu',
    language: 'Lugha',
    theme: 'Mandhari',
    number_format: 'Muundo wa nambari',
    hide_balances: 'Ficha salio',
    haptic_feedback: 'Haptic feedback',
    language_screen_title: 'Lugha',
    
    // Transaction
    send_money: 'Tuma Pesa',
    receive_money: 'Pokea Pesa',
    amount: 'Kiasi',
    recipient_address: 'Anwani ya Mpokeaji',
    purpose: 'Kusudi',
    purpose_placeholder: 'Ingiza kusudi la muamala (hiari)',
    sending: 'Inatumwa',
    copy_address: 'Nakili Anwani',
    share: 'Shiriki',
    receive_info: 'Jinsi ya Kupokea',
    receive_info_text: 'Shiriki anwani ya pochi yako au QR code na mtumaji. Hakikisha wanatumia kwenye mtandao sahihi.',
    network: 'Mtandao',
    available_balance: 'Salio Lililopo',
    payment_methods: 'Njia za Malipo',
    no_payment_methods: 'Hajajumuishwa njia za malipo bado',
    add_payment_method: 'Ongeza Njia ya Malipo',
    add_new_payment_method: 'Ongeza Njia Mpya ya Malipo',
    payment_methods_placeholder: 'Ongeza au dhibiti njia zako za malipo.',
    processing: 'Inachakata',
    wallet_address: 'Anwani ya Pochi',
    top_up: 'Jaza',
    
    // KYC Camera Screen
    kyc_camera_permission_needed: 'Idhini inahitajika',
    kyc_camera_permission_message: 'Ufikiaji wa kamera unahitajika kupiga picha za hati zako.',
    kyc_camera_error: 'Kosa',
    kyc_camera_not_ready: 'Kamera haijaandaliwa. Tafadhali subiri kidogo na ujaribu tena.',
    kyc_camera_error_title: 'Kosa la Kamera',
    kyc_camera_failed_photo: 'Imeshindwa kupiga picha. ',
    kyc_camera_capture_failed: 'Kupiga picha kwa kamera kumeshindwa. Tafadhali jaribu tena.',
    kyc_camera_crop_failed: 'Kukata picha kumeshindwa. Tafadhali jaribu tena.',
    kyc_camera_check_permissions: 'Tafadhali jaribu tena au angalia ruhusa za kamera.',
    kyc_camera_try_again: 'Jaribu Tena',
    kyc_camera_go_back: 'Rudi Nyuma',
    kyc_camera_ok: 'Sawa',
    kyc_camera_no_device: 'Kifaa cha kamera hakijapatikana.',
    kyc_camera_permission_required: 'Ruhusa ya kamera inahitajika.',
    kyc_camera_grant_permission: 'Toa Ruhusa',
    kyc_camera_passport: 'Paspoti',
    kyc_camera_driver_license: 'Leseni ya Udereva',
    kyc_camera_id_card: 'Kitambulisho',
    kyc_camera_front_side: 'Upande wa Mbele',
    kyc_camera_back_side: 'Upande wa Nyuma',
    kyc_camera_align_passport: 'Panga ukurasa wa paspoti yako',
    kyc_camera_align_id: 'Panga kitambulisho chako ndani ya fremu',
    kyc_camera_hint_subtitle: 'Hakikisha maelezo yanasomeka na epuka mwanga mkali.',
    kyc_camera_toggle_torch: 'Washa/zima tochi',
    
    // Wallet Setup Flow
    wallet_setup_title: 'Usanidi wa Pochi',
    wallet_setup_set_up_wallet: 'Sanidi Pochi Yako',
    wallet_setup_description: 'Unda pochi mpya isiyo ya ulinzi au ingiza pochi iliyopo. Una udhibiti kamili wa funguo zako za kibinafsi.',
    wallet_setup_create_new: 'Unda Pochi Mpya',
    wallet_setup_import_existing: 'Ingiza Pochi Iliyopo',
    wallet_setup_creating: 'Inaunda pochi...',
    wallet_setup_error: 'Kosa',
    wallet_setup_failed_create: 'Imeshindwa kuunda pochi',
    wallet_setup_backup_title: 'Hifadhi Pochi Yako',
    wallet_setup_backup_description: 'Andika maneno haya 12 kwa mpangilio hasa ulioorodheshwa. Hii ni sentensi yako ya kurejesha - iweke salama na usishiriki na mtu yeyote.',
    wallet_setup_generating: 'Inazalisha...',
    wallet_setup_copy: 'Nakili',
    wallet_setup_share: 'Shiriki',
    wallet_setup_warning_text: 'Usishiriki sentensi yako ya kurejesha kamwe. Mtu yeyote aliye na maneno haya anaweza kufikia pochi yako.',
    wallet_setup_backed_up: 'Nimehifadhi',
    wallet_setup_confirm_title: 'Thibitisha Sentensi Yako ya Kurejesha',
    wallet_setup_confirm_description: 'Tafadhali ingiza sentensi yako ya kurejesha ya maneno 12 ili kuthibitisha umehifadhi kwa usahihi.',
    wallet_setup_confirm_placeholder: 'Ingiza sentensi ya kurejesha ya maneno 12...',
    wallet_setup_confirm_create: 'Thibitisha na Unda Pochi',
    wallet_setup_import_title: 'Ingiza Pochi Yako',
    wallet_setup_import_description: 'Chagua jinsi unavyotaka kuingiza pochi yako iliyopo.',
    wallet_setup_recovery_phrase: 'Sentensi ya Kurejesha (maneno 12)',
    wallet_setup_recovery_placeholder: 'Ingiza sentensi ya kurejesha ya maneno 12...',
    wallet_setup_import_from_phrase: 'Ingiza kutoka Sentensi ya Kurejesha',
    wallet_setup_importing: 'Inaingiza...',
    wallet_setup_invalid_mnemonic: 'Sentensi ya Kukumbusha Batili',
    wallet_setup_invalid_mnemonic_message: 'Tafadhali ingiza sentensi ya kukumbusha halali ya maneno 12',
    wallet_setup_import_success: 'Pochi imeingizwa kwa mafanikio',
    wallet_setup_import_failed: 'Kuingiza pochi kumeshindwa',
    wallet_setup_complete_title: 'Pochi Imeundwa kwa Mafanikio!',
    wallet_setup_complete_description: 'Pochi yako isiyo ya ulinzi iko tayari. Una udhibiti kamili wa funguo zako za kibinafsi na fedha zako.',
    wallet_setup_go_dashboard: 'Nenda kwenye Dashibodi',
    wallet_setup_mnemonic_copied: 'Sentensi ya kukumbusha imenakiliwa kwenye ubao wa kunakili',
    wallet_setup_share_title: 'Hifadhi ya Pochi',
    wallet_setup_share_message: 'Sentensi yangu ya kukumbusha pochi (iweke salama): ',
    wallet_setup_mnemonic_mismatch: 'Sentensi za kukumbusha hazilingani. Tafadhali jaribu tena.',
    
    // Wallet Selection & Management
    wallet_select_title: 'Chagua Pochi',
    wallet_select_add: 'Ongeza Pochi',
    wallet_select_manage: 'Dhibiti',
    wallet_manage_title: 'Dhibiti Pochi',
    wallet_manage_disconnect: 'Tenganisha Pochi',
    wallet_manage_disconnect_confirm: 'Je, una uhakika unataka kutenganisha pochi hii?',
    wallet_manage_cancel: 'Ghairi',
    wallet_manage_disconnect_action: 'Tenganisha',
    
    // Authentication
    sign_out: 'Toka',
    sign_in: 'Ingia',
    sign_up: 'Jisajili',
    create_account: 'Unda Akaunti',
    exit_app: 'Toka kwenye Programu',
    exit_app_confirm: 'Je, una uhakika unataka kutoka?',
    
    // Form Fields
    email_required: 'Barua pepe inahitajika',
    email_invalid: 'Tafadhali ingiza barua pepe halali',
    password_required: 'Nenosiri linahitajika',
    password_min_length: 'Nenosiri lazima liwe na angalau herufi 6',
    full_name_required: 'Jina kamili linahitajika',
    confirm_password_required: 'Tafadhali thibitisha nenosiri',
    passwords_no_match: 'Nenosiri hazilingani',
    terms_required: 'Lazima ukubali masharti na hali',
    
    // Form Placeholders
    input_email_placeholder: 'Ingiza Barua Pepe Yako',
    enter_password_placeholder: 'Ingiza nenosiri lako',
    enter_full_name_placeholder: 'Ingiza jina lako kamili',
    enter_email_placeholder: 'Ingiza barua pepe yako',
    create_password_placeholder: 'Unda nenosiri',
    confirm_password_placeholder: 'Thibitisha nenosiri',
    
    // Auth Errors
    sign_in_failed: 'Kuingia Kumeshindwa',
    failed_send_otp: 'Imeshindwa Kutuma OTP',
    try_again_later: 'Tafadhali jaribu tena baadaye.',
    invalid_code: 'Msimbo Batili',
    invalid_code_message: 'Tafadhali ingiza msimbo halali wa nambari 6',
    verification_failed: 'Uthibitisho Umeshindwa',
    max_attempts_exceeded: 'Kiwango cha juu cha majaribio kimezidishwa',
    code_sent: 'Msimbo Umetumwa',
    code_sent_message: 'Msimbo mpya wa uthibitisho umetumwa kwa',
    failed_resend: 'Imeshindwa Kutuma Tena',
    
    // Email OTP Verification
    verify_your_email: 'Thibitisha Barua Pepe Yako',
    enter_verification_code: 'Ingiza Msimbo\nwa Uthibitisho',
    otp_sent_to_email: 'Ingiza msimbo wa OTP ambao tumekutumia kwenye barua pepe yako',
    verifying: 'Inathibitisha...',
    resend_otp_in: 'Rudia Kutuma OTP',
    didnt_receive_code: 'Hukupokea msimbo?',
    resend_code: 'Rudia Kutuma Msimbo',
    
    // Forgot Password
    reset_password: 'Weka Upya Nenosiri',
    forgot_password: 'Umesahau Nenosiri?',
    forgot_password_description: 'Ingiza anwani ya barua pepe yako na tutakutumia kiungo cha kuweka upya nenosiri lako',
    check_your_email: 'Angalia Barua Pepe Yako',
    password_reset_link_sent: 'Tumekutumia kiungo cha kuweka upya nenosiri',
    send_reset_link: 'Tuma Kiungo cha Kuweka Upya',
    reset_failed: 'Kuweka Upya Kumeshindwa',
    back_to_sign_in: 'Rudi kwenye Kuingia',
    
    // Sign In/Up Footer
    no_account: 'Hauna akaunti?',
    create_one: 'Unda Moja',
    have_account: 'Tayari una akaunti?',
    sign_in_here: 'Ingia',
    
    // Terms and Privacy
    i_agree_to: 'Nakubali',
    terms_of_service: 'Masharti ya Huduma',
    and: 'na',
    privacy_policy: 'Sera ya Faragha',
    
    // Home Screen
    account_verification: 'Uthibitisho wa Akaunti',
    kyc_verified: 'KYC Imethibitishwa',
    kyc_under_review: 'KYC Inakaguliwa',
    kyc_rejected: 'KYC Imekataliwa',
    kyc_pending: 'KYC Inasubiri',
    account_verification_required: 'Uthibitisho wa Akaunti Unahitajika',
    kyc_verification_message: 'Tafadhali kamilisha uthibitisho wa KYC ili kufikia vipengele vyote vya Nani Wallet.',
    kyc_banner_pending: 'Uthibitisho wako wa KYC unakaguliwa. Baadhi ya vipengele vinaweza kuwa na vikwazo.',
    kyc_banner_not_started: 'Kamilisha uthibitisho wa KYC ili kufungua vipengele vyote vya pochi.',
    kyc_description_pending: 'Tunakagua hati zako. Hii kwa kawaida inachukua siku 1-3 za kazi.',
    kyc_description_rejected: 'Uthibitisho wako umekataliwa. Tafadhali jaribu tena na hati sahihi.',
    kyc_description_not_started: 'Kamilisha uthibitisho wako ili kufikia vipengele vyote vya pochi.',
    start_verification: 'Anza Uthibitisho',
    start: 'Anza',
    retry: 'Jaribu Tena',
    nani_wallet_title: 'Nani Wallet',
    nani_wallet_description: 'Mshirika wako wa kuaminika kwa usimamizi wa fedha Halali na suluhisho za benki za Kiislamu.',
    zakat_calculator: 'Kikokotoo cha Zakat',
    investments: 'Uwekezaji',
    
    // Preferences
    primary_color: 'Rangi Kuu',
    
    // Wallet Dashboard
    all_network: 'Mitandao Yote',
    disconnect_wallet: 'Tenganisha Pochi',
    disconnect_wallet_confirm: 'Je, una uhakika unataka kutenganisha pochi yako?',
    cancel: 'Ghairi',
    disconnect: 'Tenganisha',
    error: 'Kosa',
    failed_disconnect_wallet: 'Imeshindwa kutenganisha pochi',
    no_address: 'Hakuna Anwani',
    wallet: 'Pochi',
    address_copied: 'Anwani imenakiliwa kwenye ubao wa kunakili',
    coming_soon: 'Inakuja hivi karibuni',
    
    // New UI Elements
    savings: 'Akiba',
    select_token: 'Chagua Token',
    search: 'Tafuta',
    top_up_btc: 'Jaza BTC',
    testnet_tokens: 'Token za Mtandao wa Uthibitisho',
    testnet_description: 'Token za mtandao wa uthibitisho hazina thamani ya kweli na zinatumiwa kwa madhumuni ya uthibitisho tu. Tumia mifereji hapa chini kupata token za mtandao wa uthibitisho bila malipo.',
    your_bitcoin_testnet_address: 'ANWANI YAKO YA BITCOIN MTANDAO WA UTHIBITISHO',
    network_bitcoin_testnet: 'Mtandao: Bitcoin Testnet',
    payment_method: 'NJIA YA MALIPO',
    select_payment_method: 'Chagua Njia ya Malipo',
    available_faucets: 'Mifereji Inayopatikana',
    bitcoin_testnet_faucet: 'Mfereji wa Bitcoin Testnet',
    get_free_bitcoin_testnet_coins: 'Pata sarafu za Bitcoin testnet bila malipo',
    open_faucet: 'Fungua Mfereji',
    
    // Transaction History
    transaction_history: 'Historia ya Miamala',
    all: 'Wote',
    sent: 'Imetumwa',
    received: 'Imepokelewa',
    receive: 'Pokea',
    from: 'Kutoka:',
    to: 'Kwenda:',
    confirmed: 'Imethibitishwa',
    pending: 'Inasubiri',
    failed: 'Imeshindwa',
    cancelled: 'Imefutwa',
    just_now: 'Sasa hivi',
    
    // Time and Date
    minutes_ago: 'Dakika {count} zilizopita',
    hours_ago: 'Masaa {count} yaliyopita',
    days_ago: 'Siku {count} zilizopita',
    weeks_ago: 'Wiki {count} zilizopita',
    months_ago: 'Miezi {count} yaliyopita',
    
    // Tokens and Networks
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    bitcoin_testnet: 'Bitcoin Testnet',
    ethereum_testnet: 'Ethereum Testnet',
    solana_testnet: 'Solana Testnet',
    
    // Loading and States
    loading: 'Inapakia...',
    loading_more: 'Inapakia zaidi...',
    no_transactions: 'Hakuna miamala iliyopatikana',
    no_tokens: 'Hakuna token zilizopatikana',
    transaction_history_will_appear: 'Historia ya miamala yako itaonekana hapa ukianza kufanya miamala.',
    try_again: 'Jaribu Tena',
    
    // Wallet Actions
    send_transaction: 'Tuma Muamala',
    receive_transaction: 'Pokea Muamala',
    transaction_sent: 'Muamala Umetumwa',
    transaction_received: 'Muamala Umepokelewa',
    transaction_failed: 'Muamala Umeshindwa',
    
    // Copy and Share
    copy: 'Nakili',
    copied: 'Imenakiliwa',
    share_address: 'Shiriki Anwani',
    
    // Balance and Amount
    balance: 'Salio',
    total_balance: 'Salio la Jumla',
    hide_small_assets: 'Ficha Mali Ndogo',
    show_all_assets: 'Onyesha Mali Zote',
    
    // Network and Address
    address: 'Anwani',
    
    // Status Messages
    success: 'Imefanikiwa',
    error_occurred: 'Kosa limetokea',
    please_try_again: 'Tafadhali jaribu tena',
    something_went_wrong: 'Kitu kimekwenda vibaya',
    
    // Currency and Conversion
    currency_conversion_display: '{from} = {to} (Kiwango: {rate})',
    
    // Send Dialog
    max: 'KIWANGO',
    no_wallet_connected: 'Hakuna pochi iliyounganishwa',
    please_enter_recipient_address: 'Tafadhali ingiza anwani ya mpokeaji',
    please_enter_valid_amount: 'Tafadhali ingiza kiasi halali',
    insufficient_balance: 'Salio halitoshi',
    wallet_mnemonic_not_available: 'Sentensi ya kukumbusha pochi haipatikani',
    unknown_error_occurred: 'Kosa lisilojulikana limetokea',
    failed_to_send_transaction: 'Imeshindwa kutuma muamala. Tafadhali jaribu tena.',
    token: 'Token',
    
    // Receive Dialog
    failed_to_copy_address: 'Imeshindwa kunakili anwani',
    failed_to_share: 'Imeshindwa kushiriki',
    only_send_asset_to_address: 'Tuma tu',
    asset_to_this_address: 'Mali kwenye anwani hii',
    unknown_network: 'Mtandao Usiojulikana',
    no_wallet_address_available: 'Hakuna anwani ya pochi inayopatikana kushiriki',
    share_qr_code: 'Shiriki QR Code',
    
    // Top Up Screen
    cannot_open_url: 'Haiwezi kufungua URL hii',
    failed_to_open_faucet_link: 'Imeshindwa kufungua kiungo cha mfereji',
    your_address: 'Anwani Yako',
    no_faucets_available_for_this_token: 'Hakuna mifereji inayopatikana kwa token hii',
    loading_payment_methods: 'Inapakia njia za malipo...',
    no_payment_methods_available: 'Hakuna njia za malipo zinazopatikana',
    add_payment_methods_in_settings_to_top_up_your_wallet: 'Ongeza njia za malipo katika Mipangilio ili kujaza pochi yako',
  },
};

export const t = (key: string, locale: LocaleCode, params?: Record<string, any>): string => {
  try {
    const bundle = messages[locale] || messages.en;
    let translation = bundle[key];
    
    if (!translation) {
      // Fallback to English if translation missing in selected language
      if (locale !== 'en' && messages.en[key]) {
        console.warn(`Translation missing for key "${key}" in locale "${locale}", falling back to English`);
        translation = messages.en[key];
      } else {
        // If key doesn't exist in any language, return the key itself
        console.warn(`Translation key "${key}" not found in any locale`);
        return key;
      }
    }
    
    // Handle interpolation
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }
    
    return translation;
  } catch (error) {
    console.error(`Error getting translation for key "${key}" in locale "${locale}":`, error);
    return key;
  }
};

// RTL (Right-to-Left) language support
export const isRTL = (locale: LocaleCode): boolean => {
  return locale === 'ar';
};

// Get text direction for a locale
export const getTextDirection = (locale: LocaleCode): 'ltr' | 'rtl' => {
  return isRTL(locale) ? 'rtl' : 'ltr';
};

// Get text alignment based on locale
export const getTextAlign = (locale: LocaleCode, defaultAlign: 'left' | 'center' | 'right' = 'left'): 'left' | 'center' | 'right' => {
  if (defaultAlign === 'center') return 'center';
  if (isRTL(locale)) {
    return defaultAlign === 'left' ? 'right' : 'left';
  }
  return defaultAlign;
};

// Format numbers according to locale
export const formatNumber = (num: number, locale: LocaleCode): string => {
  try {
    const localeMap: Record<LocaleCode, string> = {
      'en': 'en-US',
      'so': 'so-SO',
      'ar': 'ar-SA',
      'sw': 'sw-KE'
    };
    
    return new Intl.NumberFormat(localeMap[locale] || 'en-US').format(num);
  } catch (error) {
    // Fallback to basic formatting if Intl is not available
    return num.toLocaleString();
  }
};

// Format currency according to locale
export const formatCurrency = (amount: number, currency: string = 'USD', locale: LocaleCode): string => {
  try {
    const localeMap: Record<LocaleCode, string> = {
      'en': 'en-US',
      'so': 'so-SO',
      'ar': 'ar-SA',
      'sw': 'sw-KE'
    };
    
    return new Intl.NumberFormat(localeMap[locale] || 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Format date and time according to locale
export const formatDateTime = (date: Date, locale: LocaleCode, options?: Intl.DateTimeFormatOptions): string => {
  try {
    const localeMap: Record<LocaleCode, string> = {
      'en': 'en-US',
      'so': 'so-SO',
      'ar': 'ar-SA',
      'sw': 'sw-KE'
    };
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', defaultOptions).format(date);
  } catch (error) {
    // Fallback to basic formatting
    return date.toLocaleString();
  }
};

// Format relative time (e.g., "2 minutes ago")
export const formatRelativeTime = (date: Date, locale: LocaleCode): string => {
  try {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInMinutes < 1) {
      return t('just_now', locale);
    } else if (diffInMinutes < 60) {
      return t('minutes_ago', locale, { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('hours_ago', locale, { count: diffInHours });
    } else if (diffInDays < 7) {
      return t('days_ago', locale, { count: diffInDays });
    } else if (diffInWeeks < 4) {
      return t('weeks_ago', locale, { count: diffInWeeks });
    } else {
      return t('months_ago', locale, { count: diffInMonths });
    }
  } catch (error) {
    return t('just_now', locale);
  }
};

// Get language name in native script
export const getLanguageName = (locale: LocaleCode): string => {
  const languageNames: Record<LocaleCode, string> = {
    'en': 'English',
    'so': 'Soomaali',
    'ar': 'العربية',
    'sw': 'Kiswahili'
  };
  return languageNames[locale] || locale;
};

// Custom hook for easier i18n usage
export const useTranslation = () => {
  const { locale } = useLocale();
  
  return {
    t: (key: string, params?: Record<string, any>) => t(key, locale, params),
    locale,
    isRTL: isRTL(locale),
    textDirection: getTextDirection(locale),
    getTextAlign: (defaultAlign: 'left' | 'center' | 'right' = 'left') => getTextAlign(locale, defaultAlign),
    formatNumber: (num: number) => formatNumber(num, locale),
    formatCurrency: (amount: number, currency?: string) => formatCurrency(amount, currency, locale),
    formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDateTime(date, locale, options),
    formatRelativeTime: (date: Date) => formatRelativeTime(date, locale),
    getLanguageName: () => getLanguageName(locale),
  };
};
