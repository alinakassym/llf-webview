// llf-webview/src/components/EditLeagueModal.tsx

import { type FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface EditLeagueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditLeagueData) => Promise<void>;
  league: {
    id: string;
    name: string;
    order: number;
  } | null;
}

export interface EditLeagueData {
  name: string;
  order: number;
}

const EditLeagueModal: FC<EditLeagueModalProps> = ({
  open,
  onClose,
  onSubmit,
  league,
}) => {
  const [formData, setFormData] = useState<EditLeagueData>({
    name: "",
    order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EditLeagueData, string>>>({});

  // Заполняем форму данными лиги при открытии
  useEffect(() => {
    if (league && open) {
      setFormData({
        name: league.name,
        order: league.order,
      });
    }
  }, [league, open]);

  const handleChange = (field: keyof EditLeagueData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === "name") {
      setFormData((prev) => ({ ...prev, name: e.target.value }));
    } else {
      const numValue = Number(e.target.value);
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    }

    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditLeagueData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error updating league:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      order: 1,
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        Редактировать лигу
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Название лиги"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            fullWidth
            required
          />

          <TextField
            label="Порядок"
            type="number"
            value={formData.order}
            onChange={handleChange("order")}
            disabled={loading}
            fullWidth
            required
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLeagueModal;
