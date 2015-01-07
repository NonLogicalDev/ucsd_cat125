class Queue a where
    empty :: a b
    isEmpty :: a b -> Bool
    snoc :: a b -> b -> a b
    _head :: a b -> b
    _tail :: a b -> a b

data BatchedQueue a = BatchedQueue [a] [a] deriving (Show)

instance Queue BatchedQueue where
    empty = BatchedQueue [] []
    isEmpty (BatchedQueue f r) = null r

    snoc (BatchedQueue f r) a = checkf f (a:r)
    _head (BatchedQueue [] _)    = error "empty"
    _head (BatchedQueue (x:_) _) = x

    _tail (BatchedQueue [] _)    = error "emtpy"
    _tail (BatchedQueue (x:f) r) = checkf f r

checkf :: [a] -> [a]  -> BatchedQueue a
checkf [] r = BatchedQueue (reverse r) []
checkf h r  = BatchedQueue h r
