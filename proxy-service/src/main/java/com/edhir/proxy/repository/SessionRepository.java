package com.edhir.proxy.repository;

import com.edhir.proxy.entity.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, UUID> {
    Optional<SessionEntity> findByClientFingerprintAndTenantId(String clientFingerprint, UUID tenantId);
}
