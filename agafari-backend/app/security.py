import hashlib
import hmac
import secrets
from datetime import datetime

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.database.session import get_db
from app.models.saas import AccessSession

PBKDF2_ITERATIONS = 310_000


def hash_access_code(access_code: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", access_code.encode(), salt, PBKDF2_ITERATIONS
    )
    return f"{PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_access_code(access_code: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return hmac.compare_digest(access_code, settings.DEMO_ACCESS_CODE)

    try:
        iterations_text, salt_hex, digest_hex = stored_hash.split("$", 2)
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            access_code.encode(),
            bytes.fromhex(salt_hex),
            int(iterations_text),
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def issue_session_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def require_access_session(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> AccessSession:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid organization access session is required",
        )

    token = authorization.removeprefix("Bearer ").strip()
    result = await db.execute(
        select(AccessSession).where(AccessSession.token_hash == hash_token(token))
    )
    session = result.scalar_one_or_none()
    if (
        session is None
        or session.revoked_at is not None
        or session.expires_at <= datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access session is invalid or expired",
        )
    return session
