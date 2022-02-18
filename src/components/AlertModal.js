import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'

Modal.setAppElement('#root')

export const AlertModal = ({ isOpen, handleClose, darkMode, colorBlindMode, styles, message }) => (
    <Modal isOpen={isOpen} onRequestClose={handleClose} style={styles} contentLabel="Alert Modal">
        <div className={`h-full ${darkMode ? 'dark' : ''}`}>
            <button
                className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8"
                onClick={handleClose}
            >
                <Close />
            </button>
            <div className="h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark">
                <div className="flex-1 text-center w-full sm:text-base text-sm">
                    {message}
                </div>
            </div>
        </div>
    </Modal>
)
