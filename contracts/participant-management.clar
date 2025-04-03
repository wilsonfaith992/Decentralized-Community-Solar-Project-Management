;; Participant Management Contract
;; Tracks community member investments

(define-data-var admin principal tx-sender)
(define-map participants
  { participant-id: principal }
  {
    investment-amount: uint,
    join-date: uint,
    active: bool,
    installation-id: uint
  }
)

;; Read-only functions
(define-read-only (get-participant (participant-id principal))
  (map-get? participants { participant-id: participant-id })
)

;; Public functions
(define-public (join-community (investment-amount uint) (installation-id uint))
  (begin
    (asserts! (> investment-amount u0) (err u400))
    (map-set participants
      { participant-id: tx-sender }
      {
        investment-amount: investment-amount,
        join-date: block-height,
        active: true,
        installation-id: installation-id
      }
    )
    (ok true)
  )
)

(define-public (update-investment (new-amount uint))
  (match (map-get? participants { participant-id: tx-sender })
    participant (begin
      (map-set participants
        { participant-id: tx-sender }
        (merge participant { investment-amount: new-amount })
      )
      (ok true)
    )
    (err u404)
  )
)

(define-public (leave-community)
  (match (map-get? participants { participant-id: tx-sender })
    participant (begin
      (map-set participants
        { participant-id: tx-sender }
        (merge participant { active: false })
      )
      (ok true)
    )
    (err u404)
  )
)

(define-public (remove-participant (participant-id principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (match (map-get? participants { participant-id: participant-id })
      participant (begin
        (map-set participants
          { participant-id: participant-id }
          (merge participant { active: false })
        )
        (ok true)
      )
      (err u404)
    )
  )
)

