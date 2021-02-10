
/** 
 * Overall variant of stepmania install
 * Generally breaks down into Major.Minor version,
 * or forked variants of these for club fantastic-like installations
 */
export const SM_INSTALL_VARIANT = {
    SM_UNKNOWN: 0,
    SM_5_0: 1,
    SM_5_1: 2,
    // 5.2 was never released, no one should be running it
    SM_5_3: 3,
    SM_CLUB_FANTASTIC: 4,
};

const SM_DATA_NAME = "Save/everyone.dance.txt"

// All paths to SM data if not in portable mode
// Add support for more versions of SM here and in _install_variant()
const SM_DATA_PATHS = {
    // Windows: AppData/Stepmania X.Y
    ["win32"]: {
        base_dir: electron.getAppDataPath(),
        [SM_INSTALL_VARIANT.SM_5_0]: "StepMania 5",
        [SM_INSTALL_VARIANT.SM_5_1]: "StepMania 5.1",
        [SM_INSTALL_VARIANT.SM_5_3]: "StepMania 5.3",
        [SM_INSTALL_VARIANT.SM_CLUB_FANTASTIC]: "Club Fantastic StepMania"
    },
    // Linux: ~/.stepmania-X.Y
    ["linux"]: {
        base_dir: electron.getHomePath(),
        [SM_INSTALL_VARIANT.SM_5_0]: ".stepmania-5.0",
        [SM_INSTALL_VARIANT.SM_5_1]: ".stepmania-5.1",
        [SM_INSTALL_VARIANT.SM_5_3]: ".stepmania-5.3"
    },
    // Mac: ~/Library/Application Support/StepMania X.Y
    ["darwin"]: {
        base_dir: electron.getHomePath(),
        [SM_INSTALL_VARIANT.SM_5_0]: "StepMania 5",
        [SM_INSTALL_VARIANT.SM_5_1]: "StepMania 5.1",
        [SM_INSTALL_VARIANT.SM_5_3]: "StepMania 5.3"
    },

}

/**
 * Functionality for determining Stepmania installation type
 * and locating paths
 */
export default class SMInstallation {

    /**
     * Construct the class and analyse a sm installation
     * @param {String} stepmania_dir Path to stepmania installation
     * @param {String} platform Platform string from electron.process.platform
     */
    constructor(stepmania_dir, platform) {
        // TODO: I wanted to import process from 'electron' in this file,
        // but when I did that the app wouldn't start, error 'require is not defined'
        this.platform = electron.os.platform();

        this.install_variant = this._install_variant(stepmania_dir);
        this.variant_dir = this._locate_variant_install(stepmania_dir);
        this.is_portable = this._is_portable(this.variant_dir);
        this.score_file = this._locate_score_file(this.variant_dir);
    }

    /**
     * Determine the overall variant of stepmania
     * @param {String} stepmania_dir Path to stepmania installation
     * @returns {SM_INSTALL_VARIANT} The installation variant
     */
    _install_variant(stepmania_dir) {
        if (!stepmania_dir) return SM_INSTALL_VARIANT.SM_UNKNOWN;

        if (stepmania_dir.toLowerCase().includes("club") && stepmania_dir.toLowerCase().includes("fantastic")) {
            return SM_INSTALL_VARIANT.SM_CLUB_FANTASTIC;
        }
        else if (stepmania_dir.includes("5.1")) {
            return SM_INSTALL_VARIANT.SM_5_1;
        }
        else if (stepmania_dir.includes("5.3")) {
            return SM_INSTALL_VARIANT.SM_5_3;
        }
        // Default to SM 5.0.x no matter the directory name
        return SM_INSTALL_VARIANT.SM_5_0;
    }

    /**
     * Given a base install directory, apply per-variant
     * suffixes as required
     * @param {String} stepmania_dir Path to stepmania installation
     * @returns {String} Updated directory to account for install variant
     */
    _locate_variant_install(stepmania_dir) {
        if (this.install_variant && this.install_variant === SM_INSTALL_VARIANT.SM_5_3) {
            return stepmania_dir.replace("Appearance", "");
        }
        return stepmania_dir;
    }

    /**
     * Check if a stepmania install is in portable mode
     * Portable installs store everything next to the
     * sm executable, and don't store information in 
     * per user/appdata folders
     */
    _is_portable() {
        const portable_path = this.variant_dir + "/portable.ini";
        return electron.fs.existsSync(portable_path);
    }

    /**
     * Locate everyone.dance.txt within the sm
     * installation, or appdata directories
     * @returns {String} Path to everyone.dance.txt
     */
    _locate_score_file() {
        // Portable installs are simple - Save folder is next to executable
        if (this.is_portable) {
            return this.variant_dir + "/Save/everyone.dance.txt";
        }

        if (SM_DATA_PATHS[this.platform] && SM_DATA_PATHS[this.platform][this.install_variant])
        {
            const base_dir = SM_DATA_PATHS[this.platform].base_dir;
            const variant_name = SM_DATA_PATHS[this.platform][this.install_variant];
            return `${base_dir}/${variant_name}/${SM_DATA_NAME}`
        }

        return null;
    }

}
