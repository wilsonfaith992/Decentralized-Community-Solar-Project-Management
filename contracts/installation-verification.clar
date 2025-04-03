;; Installation Verification Contract
;; Validates solar equipment and capacity

(define-data-var admin principal tx-sender)
(define-map installations
  { installation-id: uint }
  {
    owner: principal,
    capacity: uint,
    location: (string-utf8 100),
    verified: bool,
    installation-date: uint
  }
)
(define-data-var next-installation-id uint u1)

;; Read-only functions
(define-read-only (get-installation (installation-id uint))
  (map-get? installations { installation-id: installation-id })
)

(define-read-only (get-next-id)
  (var-get next-installation-id)
)

;; Public functions
(define-public (register-installation (capacity uint) (location (string-utf8 100)))
  (let ((installation-id (var-get next-installation-id)))
    (begin
      (map-set installations
        { installation-id: installation-id }
        {
          owner: tx-sender,
          capacity: capacity,
          location: location,
          verified: false,
          installation-date: block-height
        }
      )
      (var-set next-installation-id (+ installation-id u1))
      (ok installation-id)
    )
  )
)

(define-public (verify-installation (installation-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (match (map-get? installations { installation-id: installation-id })
      installation (begin
        (map-set installations
          { installation-id: installation-id }
          (merge installation { verified: true })
        )
        (ok true)
      )
      (err u404)
    )
  )
)

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (var-set admin new-admin)
    (ok true)
  )
)

