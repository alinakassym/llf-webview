// llf-webview/src/components/PlayerSelectionModal.tsx

import { type FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface PlayerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  position: string;
}

const PlayerSelectionModal: FC<PlayerSelectionModalProps> = ({
  open,
  onClose,
  position,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <PersonAddIcon color="primary" style={{ fontSize: 24 }} />
          <Typography variant="body1">
            Добавить игрока на позицию "{position}"
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Функционал выбора игрока будет добавлен здесь
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button variant="contained" onClick={onClose}>
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerSelectionModal;
