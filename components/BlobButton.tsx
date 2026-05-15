import React from 'react';

interface BlobButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const BlobButton: React.FC<BlobButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <>
      <button className={`blob-btn ${className}`} {...props}>
        <span className="blob-btn__text flex items-center justify-center relative z-20">
            {children}
        </span>
        <span className="blob-btn__inner">
          <span className="blob-btn__blobs">
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
          </span>
        </span>
      </button>
    </>
  );
};

export default BlobButton;
