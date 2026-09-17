import os
import sys
import types
from pathlib import Path

# Add backend directory and root directory to sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_ROOT_DIR = _CURRENT_DIR.parent

for p in [str(_CURRENT_DIR), str(_ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ.setdefault("VERCEL", "1")

# Ensure 'backend' is recognized as a package pointing to _CURRENT_DIR
if "backend" not in sys.modules:
    try:
        import backend  # noqa
    except ImportError:
        _backend_pkg = types.ModuleType("backend")
        _backend_pkg.__path__ = [str(_CURRENT_DIR)]
        _backend_pkg.__file__ = str(_CURRENT_DIR / "__init__.py")
        sys.modules["backend"] = _backend_pkg

from backend.app.main import app
