import { createContext, useContext, useState } from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";

Modal.setAppElement("#root");

const ModalContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useModalContext = () => {
    return useContext(ModalContext);
};

const customStyles = {
    overlay: {
        position: "fixed",
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
    },
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        width: "min(960px, calc(100vw - 24px))",
        maxWidth: "960px",
        marginRight: "-50%",
        padding: 0,
        border: 0,
        borderRadius: 16,
        background: "transparent",
        overflow: "visible",
        transform: "translate(-50%, -50%)",
    },
};

const ModalProvider = ({ children }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [videoId, setVideoId] = useState("");

    const closeTrailerModal = () => {
        setModalIsOpen(false);
        setVideoId("");
    };

    const handlePlayTrailer = (trailerUrl) => {
        // const trailerKey = (trailerUrl || "").split("v=")[1];
        const trailerKey = trailerUrl;
        setModalIsOpen(true);
        setVideoId(trailerKey);
    };

    return (
        <ModalContext.Provider value={{ handlePlayTrailer }}>
            {children}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeTrailerModal}
                style={customStyles}
                contentLabel="Trailer Modal"
            >
                <div className="relative rounded-2xl bg-surface p-2 shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:p-3">
                    <button
                        type="button"
                        onClick={closeTrailerModal}
                        className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface-2 text-xl leading-none text-white shadow-lg transition-colors hover:bg-surface-3 sm:-right-3 sm:-top-3 sm:h-10 sm:w-10"
                        aria-label="Đóng trailer"
                    >
                        ×
                    </button>
                    <div className="aspect-video overflow-hidden rounded-xl bg-black">
                        {videoId && (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="Movie trailer"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                style={{ border: 0 }}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </ModalContext.Provider>
    );
};

ModalProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ModalProvider;
