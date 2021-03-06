declare namespace DialogsOptionsAPI {
  /**
   * Open directory options
   */
  interface OpenDirectory {
    /**
     * Dialog title
     */
    title?: string;
    /**
     * Start default path
     */
    defaultPath?: string;
    /**
     *  Custom label for the confirmation button, when left empty the default label will be used.
     */
    buttonLabel?: string;
    /**
     * Message to display above input boxes
     *
     * _MacOS only_
     */
    message?: string;
  }
}
