import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';

interface ImageViewerDialogProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  open,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          maxWidth: '90vw',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Botão de fechar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Container da imagem */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Imagem atual */}
          <img
            src={images[currentIndex]}
            alt={`Imagem ${currentIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />

          {/* Botões de navegação */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <PrevIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <NextIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* Miniaturas */}
        {images.length > 1 && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                maxWidth: '80vw',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'background.paper',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'primary.main',
                  borderRadius: 4,
                },
              }}
            >
              {images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: index === currentIndex ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog; 