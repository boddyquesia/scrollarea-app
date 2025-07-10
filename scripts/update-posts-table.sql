-- Actualizar tabla de posts para incluir expiración
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT FALSE;

-- Función para marcar posts como expirados
CREATE OR REPLACE FUNCTION mark_expired_posts()
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET is_expired = TRUE 
  WHERE expires_at < NOW() AND is_expired = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar posts del usuario
CREATE OR REPLACE FUNCTION decrement_user_posts(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET total_posts = GREATEST(0, total_posts - 1)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_expired ON posts(is_expired);
CREATE INDEX IF NOT EXISTS idx_posts_user_expired ON posts(user_id, is_expired);

-- Actualizar posts existentes con fecha de expiración
UPDATE posts 
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;
