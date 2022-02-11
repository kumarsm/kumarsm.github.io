import { ReactComponent as Github } from '../data/Github.svg'
import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'

Modal.setAppElement('#root')

export const InfoModal = ({ isOpen, handleClose, darkMode, colorBlindMode, styles }) => (
  <Modal isOpen={isOpen} onRequestClose={handleClose} style={styles} contentLabel="Game Info Modal">
    <div className={`h-full ${darkMode ? 'dark' : ''}`}>
      <button
        className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8"
        onClick={handleClose}
      >
        <Close />
      </button>
      <div className="h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark">
        <div className="flex-1 w-full sm:text-base text-sm">
          <h1 className="text-center sm:text-3xl text-2xl">About Wordle Challenge</h1>
          <ul className="list-disc pl-5 block sm:text-base text-sm">
            <li className="mt-6 mb-2"><a href="https://www.powerlanguage.co.uk/wordle/"><b>Wordle</b></a> is an online daily word guessing game by <a href="https://twitter.com/powerlanguish"><b>Josh Wardle</b>.  </a><a href="https://www.twitter.com/devangvang"><b>Devang Thakkar</b>'s </a><a href="https://www.devangthakkar.com/wordle_archive/"><b>Wordle Archive</b> </a>enables you to play past wordles you may have missed</li>
          </ul>
          <ul className="list-disc pl-5 block sm:text-base text-sm">
            <li className="mt-3 mb-2"><b>Wordle Challenge</b> (made with love by kumarsm and justSahil) takes it further, so you can create and challenge friends with your own wordles!</li>
          </ul>
          <h1 className="mt-6 text-center sm:text-3xl text-2xl">How to play?</h1>
          <ul className="list-disc pl-5 block sm:text-base text-sm">
            <li className="mt-6 mb-2">Using only valid words, you have 6 guesses to guess the challenge word. After each guess, each letter will turn:</li>
          </ul>
          <div className="mb-3 mt-3 flex items-center">
            <span className={`${colorBlindMode ? 'nm-inset-orange-500' : 'nm-inset-n-green'} text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded`}>
              W
            </span>
            <span className="mx-2"></span>
            <span>{`${colorBlindMode ? 'orange - ' : 'green = '} correct letter, correct position`}</span>
          </div>
          <div className="mb-3">
            <span className={`${colorBlindMode ? 'nm-inset-blue-300' : 'nm-inset-yellow-500'} text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded`}>
              W
            </span>
            <span className="mx-2"></span>
            <span>{`${colorBlindMode ? 'blue - ' : 'yellow = '} correct letter, wrong position`}</span>
          </div>
          <span className="nm-inset-n-gray text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded">
            W
          </span>
          <span className="mx-2"></span>
          <span>gray =  wrong letter</span>
        </div>
      </div>
    </div>
  </Modal>
)
