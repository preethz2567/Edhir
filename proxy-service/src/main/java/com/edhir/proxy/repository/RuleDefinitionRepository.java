package com.edhir.proxy.repository;

import com.edhir.proxy.entity.RuleDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RuleDefinitionRepository extends JpaRepository<RuleDefinitionEntity, UUID> {

    /**
     * Loads all active rules that apply to the given tenant (tenant-specific rules)
     * OR global rules (tenant_id IS NULL). Used by RuleEngine on every request.
     */
    @Query("SELECT r FROM RuleDefinitionEntity r WHERE r.isActive = true AND (r.tenantId = :tenantId OR r.tenantId IS NULL)")
    List<RuleDefinitionEntity> findActiveRulesForTenant(@Param("tenantId") UUID tenantId);
}
