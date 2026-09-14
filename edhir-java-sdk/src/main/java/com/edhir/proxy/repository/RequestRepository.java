package com.edhir.proxy.repository;

import com.edhir.proxy.entity.RequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<RequestEntity, UUID> {
    List<RequestEntity> findTop50ByOrderByTimestampDesc();
    long countBySessionIdAndTimestampAfter(UUID sessionId, java.time.LocalDateTime since);
}
